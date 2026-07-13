const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const GiftCard = require('../models/GiftCard');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'TKGC-';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// POST /api/gift-cards - Purchase a gift card
router.post('/', requireAuth, async (req, res) => {
  try {
    const { amount, recipientEmail, recipientName, message } = req.body;
    if (!amount || amount < 5 || amount > 500) {
      return res.status(400).json({ message: 'Amount must be between $5 and $500' });
    }

    const user = await User.findOne({ clerkId: req.user.sub });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const code = generateCode();
    const giftCard = await GiftCard.create({
      code,
      initialBalance: amount,
      balance: amount,
      purchaser: user._id,
      recipientEmail: recipientEmail || user.email,
      recipientName: recipientName || '',
      message: message || '',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    });

    // Send gift card email to recipient
    if (recipientEmail) {
      sendEmail({
        to: recipientEmail,
        subject: `You received a gift card from ${user.firstName}!`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#1a1a2e;">You've Got a Gift Card!</h2>
            <p>${user.firstName} sent you a <strong>$${amount} gift card</strong> to TKAYKONCEPTS!</p>
            ${message ? `<p style="font-style:italic;color:#666;">"${message}"</p>` : ''}
            <div style="background:#f9f9f9;border:2px dashed #F59E0B;border-radius:12px;padding:24px;text-align:center;margin:20px 0;">
              <p style="margin:0 0 8px;color:#666;font-size:12px;">YOUR GIFT CARD CODE</p>
              <p style="margin:0;font-size:24px;font-weight:bold;letter-spacing:2px;color:#1a1a2e;">${code}</p>
            </div>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/shop" style="display:inline-block;background:#F59E0B;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">Shop Now</a>
            <p style="color:#666;font-size:12px;margin-top:30px;">TKAYKONCEPTS INT'L - Faith. Purpose. Identity.</p>
          </div>
        `,
      }).catch(() => {});
    }

    res.status(201).json({ data: giftCard });
  } catch (error) {
    console.error('Create gift card error:', error);
    res.status(500).json({ message: 'Failed to create gift card' });
  }
});

// POST /api/gift-cards/validate - Validate a gift card code
router.post('/validate', requireAuth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Code is required' });

    const giftCard = await GiftCard.findOne({ code: code.toUpperCase(), isActive: true });
    if (!giftCard) return res.status(404).json({ message: 'Gift card not found' });
    if (giftCard.expiresAt && giftCard.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Gift card has expired' });
    }
    if (giftCard.balance <= 0) {
      return res.status(400).json({ message: 'Gift card has no balance remaining' });
    }

    res.json({ data: { code: giftCard.code, balance: giftCard.balance } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to validate gift card' });
  }
});

// POST /api/gift-cards/redeem - Apply gift card to checkout
router.post('/redeem', requireAuth, async (req, res) => {
  try {
    const { code, orderId, amount } = req.body;
    const giftCard = await GiftCard.findOne({ code: code.toUpperCase(), isActive: true });
    if (!giftCard) return res.status(404).json({ message: 'Gift card not found' });
    if (giftCard.balance < amount) {
      return res.status(400).json({ message: `Insufficient balance. Available: $${giftCard.balance.toFixed(2)}` });
    }

    giftCard.balance -= amount;
    giftCard.ordersUsed.push({ order: orderId, amount, usedAt: new Date() });
    if (giftCard.balance <= 0) {
      giftCard.isActive = false;
      const redeemer = await User.findOne({ clerkId: req.user.sub });
      giftCard.redeemedBy = redeemer?._id;
      giftCard.redeemedAt = new Date();
    }
    await giftCard.save();

    res.json({ data: { remainingBalance: giftCard.balance } });
  } catch (error) {
    console.error('Redeem gift card error:', error);
    res.status(500).json({ message: 'Failed to redeem gift card' });
  }
});

// GET /api/gift-cards/my - Get my gift cards
router.get('/my', requireAuth, async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.user.sub });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const giftCards = await GiftCard.find({
      $or: [{ purchaser: user._id }, { recipientEmail: user.email }],
    }).sort({ createdAt: -1 });

    res.json({ data: giftCards });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get gift cards' });
  }
});

// GET /api/gift-cards/admin - Admin: list all gift cards
router.get('/admin', requireAuth, checkRole('admin', 'super_admin'), async (req, res) => {
  try {
    const cards = await GiftCard.find().sort({ createdAt: -1 }).limit(100)
      .populate('purchaser', 'firstName lastName email');
    const stats = await GiftCard.aggregate([
      { $group: {
        _id: null,
        totalIssued: { $sum: 1 },
        totalValue: { $sum: '$initialBalance' },
        totalRedeemed: { $sum: { $subtract: ['$initialBalance', '$balance'] } },
        totalOutstanding: { $sum: '$balance' },
      }},
    ]);
    res.json({ data: cards, stats: stats[0] || { totalIssued: 0, totalValue: 0, totalRedeemed: 0, totalOutstanding: 0 } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get gift cards' });
  }
});

module.exports = router;
