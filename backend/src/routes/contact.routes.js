const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { requireAuth } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const { contactLimiter } = require('../middleware/rateLimiter');
const { sendEmail } = require('../utils/email');

// POST /api/contacts - Public: submit contact form (rate limited)
router.post('/', contactLimiter, async (req, res) => {
  try {
    const { name, email, phone, subject, type, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Name, email, subject, and message are required' });
    }
    const contact = await Contact.create({ name, email, phone, subject, type, message });

    // Notify admin of new contact (non-blocking)
    sendEmail({
      to: process.env.EMAIL_FROM || 'info@tkaykoncepts.com',
      subject: `New Contact: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a2e;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${name}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${email}</td></tr>
            ${phone ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${phone}</td></tr>` : ''}
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Type:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${type || 'general'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Subject:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${subject}</td></tr>
          </table>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #666; font-size: 12px;">Reply directly to ${email} to respond.</p>
        </div>
      `,
    }).catch(() => {});

    res.status(201).json({ data: contact, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// GET /api/contacts/admin - Admin: list contacts
router.get('/admin', requireAuth, checkRole('admin', 'super_admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = {};
    if (status) query.status = status;

    const [contacts, total] = await Promise.all([
      Contact.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Contact.countDocuments(query),
    ]);

    res.json({
      data: contacts,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'Failed to fetch contacts' });
  }
});

// PUT /api/contacts/admin/:id - Admin: update status
router.put('/admin/:id', requireAuth, checkRole('admin', 'super_admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const contact = await Contact.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json({ data: contact });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ message: 'Failed to update contact' });
  }
});

module.exports = router;
