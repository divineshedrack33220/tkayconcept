require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const corsOptions = require('./config/cors');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter, authLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(helmet());
app.use(compression());
app.use(cors(corsOptions));
app.use(morgan('dev'));

app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), require('./routes/webhook'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(generalLimiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/bootstrap/admin', authLimiter, async (req, res) => {
  try {
    const User = require('./models/User');
    const adminExists = await User.findOne({ role: { $in: ['admin', 'super_admin'] } });
    if (adminExists) {
      return res.status(403).json({ message: 'Admin already exists. Use the regular role update endpoint.' });
    }

    const { clerkId, email } = req.body;
    if (!clerkId || !email) {
      return res.status(400).json({ message: 'clerkId and email are required' });
    }

    let user = await User.findOne({ clerkId });
    if (user) {
      user.role = 'super_admin';
      await user.save();
    } else {
      user = await User.create({ clerkId, email, role: 'super_admin' });
    }

    res.json({ data: user, message: 'First admin created successfully' });
  } catch (error) {
    console.error('Bootstrap admin error:', error);
    res.status(500).json({ message: 'Failed to bootstrap admin' });
  }
});

app.use('/api/products', require('./routes/product.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/blog', require('./routes/blog.routes'));
app.use('/api/contacts', require('./routes/contact.routes'));
app.use('/api/wishlist', require('./routes/wishlist.routes'));
app.use('/api/media', require('./routes/media.routes'));
app.use('/api/testimonials', require('./routes/testimonial'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/coupons', require('./routes/coupon'));
app.use('/api/reviews', require('./routes/review'));
app.use('/api/abandoned-carts', require('./routes/abandoned-cart.routes'));
app.use('/api/marketing', require('./routes/marketing.routes'));
app.use('/api/gift-cards', require('./routes/gift-card.routes'));

app.get('/api/track', async (req, res) => {
  try {
    const { orderNumber, email } = req.query;
    if (!orderNumber || !email) return res.status(400).json({ error: 'orderNumber and email are required' });
    const Order = require('./models/Order');
    const User = require('./models/User');
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'Order not found' });
    const order = await Order.findOne({ orderNumber, user: user._id }).select('orderNumber orderStatus paymentStatus trackingNumber trackingUrl carrier createdAt updatedAt items total shippingAddress');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ data: order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use(errorHandler);

// Automated abandoned cart recovery — runs every 30 minutes
const AbandonedCart = require('./models/AbandonedCart');
const User = require('./models/User');

async function processAbandonedCarts() {
  try {
    const cutoff = new Date(Date.now() - 30 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const carts = await AbandonedCart.find({
      recoveryEmailSent: false,
      recovered: false,
      createdAt: { $lte: cutoff, $gte: sevenDaysAgo },
    }).populate('user', 'firstName email');

    for (const cart of carts) {
      const userName = cart.user?.firstName || 'there';
      const itemList = cart.items.map(
        (item) => `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td><td style="padding:8px;border-bottom:1px solid #eee;">x${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;">$${(item.price * item.quantity).toFixed(2)}</td></tr>`
      ).join('');

      const { sendEmail } = require('./utils/email');
      sendEmail({
        to: cart.email,
        subject: 'You left something behind!',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#1a1a2e;">Still thinking about these?</h2>
            <p>Hi ${userName},</p>
            <p>You left some great items in your cart. They're selling fast — don't miss out!</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
              <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;">Item</td><td style="padding:8px;font-weight:bold;">Qty</td><td style="padding:8px;font-weight:bold;">Price</td></tr>
              ${itemList}
              <tr><td colspan="2" style="padding:8px;font-weight:bold;">Subtotal</td><td style="padding:8px;font-weight:bold;">$${cart.subtotal.toFixed(2)}</td></tr>
            </table>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/shop" style="display:inline-block;background:#F59E0B;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">Complete Your Order</a>
            <p style="color:#666;font-size:12px;margin-top:30px;">TKAYKONCEPTS INT'L - Faith. Purpose. Identity.</p>
          </div>
        `,
      }).catch(() => {});

      cart.recoveryEmailSent = true;
      await cart.save();
    }

    if (carts.length > 0) {
      console.log(`[Cron] Sent ${carts.length} abandoned cart recovery emails`);
    }
  } catch (error) {
    console.error('[Cron] Abandoned cart error:', error.message);
  }
}

// Run every 30 minutes
setInterval(processAbandonedCarts, 30 * 60 * 1000);
// Run once on startup after 5 minutes
setTimeout(processAbandonedCarts, 5 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

module.exports = app;
