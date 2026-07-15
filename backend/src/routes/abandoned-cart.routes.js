const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const AbandonedCart = require('../models/AbandonedCart');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');

// POST /api/abandoned-carts - Log a cart (called by frontend periodically)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { items, subtotal } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ message: 'No items' });

    const user = await User.findOne({ clerkId: req.user.sub });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Upsert: update if exists within last 24h, else create
    const existing = await AbandonedCart.findOne({
      user: user._id,
      recovered: false,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    if (existing) {
      existing.items = items;
      existing.subtotal = subtotal || 0;
      await existing.save();
      return res.json({ data: existing });
    }

    const cart = await AbandonedCart.create({
      user: user._id,
      email: user.email,
      items,
      subtotal: subtotal || 0,
    });

    res.status(201).json({ data: cart });
  } catch (error) {
    console.error('Log abandoned cart error:', error);
    res.status(500).json({ message: 'Failed to log cart' });
  }
});

// POST /api/abandoned-carts/send-recovery - Admin: send recovery emails
router.post('/send-recovery', requireAuth, checkRole('admin', 'super_admin'), async (req, res) => {
  try {
    const cutoff = new Date(Date.now() - 30 * 60 * 1000); // 30 min ago
    const abandoned = await AbandonedCart.find({
      recoveryEmailSent: false,
      recovered: false,
      createdAt: { $lte: cutoff },
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // last 7 days
    }).populate('user', 'firstName email');

    let sentCount = 0;

    for (const cart of abandoned) {
      const userName = cart.user?.firstName || 'there';
      const itemList = cart.items.map(
        (item) => `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td><td style="padding:8px;border-bottom:1px solid #eee;">x${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;">$${(item.price * item.quantity).toFixed(2)}</td></tr>`
      ).join('');

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
            <p style="color:#666;font-size:12px;margin-top:30px;">TK Concepts - Faith. Purpose. Identity.</p>
          </div>
        `,
      }).catch(() => {});

      cart.recoveryEmailSent = true;
      await cart.save();
      sentCount++;
    }

    res.json({ data: { sentCount, totalFound: abandoned.length } });
  } catch (error) {
    console.error('Send recovery emails error:', error);
    res.status(500).json({ message: 'Failed to send recovery emails' });
  }
});

// POST /api/abandoned-carts/mark-recovered - Called when order is placed
router.post('/mark-recovered', requireAuth, async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.user.sub });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { orderId } = req.body;
    await AbandonedCart.updateMany(
      { user: user._id, recovered: false },
      { recovered: true, recoveredOrderId: orderId }
    );

    res.json({ message: 'Marked as recovered' });
  } catch (error) {
    console.error('Mark recovered error:', error);
    res.status(500).json({ message: 'Failed to mark recovered' });
  }
});

// GET /api/abandoned-carts/admin - Admin: list abandoned carts
router.get('/admin', requireAuth, checkRole('admin', 'super_admin'), async (req, res) => {
  try {
    const carts = await AbandonedCart.find({ recovered: false })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('user', 'firstName lastName email');

    const stats = await AbandonedCart.aggregate([
      { $match: { recovered: false } },
      { $group: { _id: null, total: { $sum: 1 }, totalValue: { $sum: '$subtotal' } } },
    ]);

    res.json({
      data: carts,
      stats: stats[0] || { total: 0, totalValue: 0 },
    });
  } catch (error) {
    console.error('Get abandoned carts error:', error);
    res.status(500).json({ message: 'Failed to get abandoned carts' });
  }
});

module.exports = router;
