const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const Campaign = require('../models/Campaign');
const Newsletter = require('../models/Newsletter');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');

router.get('/campaigns', requireAuth, checkRole('admin', 'super_admin'), async (req, res, next) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 }).limit(50);
    res.json({ data: campaigns });
  } catch (error) {
    next(error);
  }
});

router.post('/campaigns', requireAuth, checkRole('admin', 'super_admin'), async (req, res, next) => {
  try {
    const { name, type, subject, content } = req.body;
    if (!name || !content) {
      return res.status(400).json({ message: 'Name and content are required' });
    }

    let recipientCount = 0;
    if (type === 'email') {
      recipientCount = await Newsletter.countDocuments({ isActive: true });
    } else {
      recipientCount = await User.countDocuments({ phone: { $exists: true, $ne: '' } });
    }

    const user = await User.findOne({ clerkId: req.user.sub });

    const campaign = await Campaign.create({
      name,
      type: type || 'email',
      subject: subject || name,
      content,
      recipientCount,
      createdBy: user?._id,
    });

    res.status(201).json({ data: campaign });
  } catch (error) {
    next(error);
  }
});

router.post('/campaigns/:id/send', requireAuth, checkRole('admin', 'super_admin'), async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    if (campaign.status === 'sent') return res.status(400).json({ message: 'Campaign already sent' });

    if (campaign.type === 'email') {
      const subscribers = await Newsletter.find({ isActive: true }).lean();

      subscribers.forEach((sub) => {
        sendEmail({
          to: sub.email,
          subject: campaign.subject || campaign.name,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <h2 style="color:#1a1a2e;">${campaign.subject || campaign.name}</h2>
              <div>${campaign.content}</div>
              <hr style="border:none;border-top:1px solid #eee;margin:30px 0;" />
              <p style="color:#666;font-size:11px;">You're receiving this because you subscribed to TK Concepts emails.</p>
              <p style="color:#666;font-size:11px;">TK Concepts - Faith. Purpose. Identity.</p>
            </div>
          `,
        }).catch(() => {});
      });

      campaign.sentCount = subscribers.length;
      campaign.status = 'sent';
      campaign.sentAt = new Date();
      await campaign.save();

      return res.json({ data: campaign, message: `Sending to ${subscribers.length} subscribers` });
    }

    campaign.status = 'sent';
    campaign.sentAt = new Date();
    await campaign.save();
    res.json({ data: campaign, message: 'SMS campaign marked as sent (SMS provider not configured)' });
  } catch (error) {
    next(error);
  }
});

router.delete('/campaigns/:id', requireAuth, checkRole('admin', 'super_admin'), async (req, res, next) => {
  try {
    await Campaign.findByIdAndDelete(req.params.id);
    res.json({ message: 'Campaign deleted' });
  } catch (error) {
    next(error);
  }
});

router.get('/subscribers', requireAuth, checkRole('admin', 'super_admin'), async (req, res, next) => {
  try {
    const subscribers = await Newsletter.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ data: subscribers, total: subscribers.length });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', requireAuth, checkRole('admin', 'super_admin'), async (req, res, next) => {
  try {
    const [subscriberCount, campaignStats] = await Promise.all([
      Newsletter.countDocuments({ isActive: true }),
      Campaign.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, totalSent: { $sum: '$sentCount' } } },
      ]),
    ]);

    res.json({
      data: {
        subscriberCount,
        campaigns: campaignStats,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
