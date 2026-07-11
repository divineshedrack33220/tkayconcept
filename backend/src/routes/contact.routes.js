const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { requireAuth } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// POST /api/contacts - Public: submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, type, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Name, email, subject, and message are required' });
    }
    const contact = await Contact.create({ name, email, phone, subject, type, message });
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
