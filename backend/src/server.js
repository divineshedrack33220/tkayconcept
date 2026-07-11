require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const corsOptions = require('./config/cors');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(helmet());
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

app.post('/api/bootstrap/admin', async (req, res) => {
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

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

module.exports = app;
