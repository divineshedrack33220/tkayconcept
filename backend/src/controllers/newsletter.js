const Newsletter = require('../models/Newsletter');

exports.subscribe = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const existing = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await existing.save();
        return res.json({ message: 'Welcome back! You have been re-subscribed.' });
      }
      return res.json({ message: 'You are already subscribed!' });
    }
    await Newsletter.create({ email: email.toLowerCase() });
    res.status(201).json({ message: 'Successfully subscribed!' });
  } catch (err) {
    next(err);
  }
};

exports.unsubscribe = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const subscriber = await Newsletter.findOne({ email: email.toLowerCase() });
    if (!subscriber) return res.status(404).json({ error: 'Email not found' });
    subscriber.isActive = false;
    await subscriber.save();
    res.json({ message: 'Successfully unsubscribed' });
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { active, limit = 100 } = req.query;
    const filter = {};
    if (active !== undefined) filter.isActive = active === 'true';
    const subscribers = await Newsletter.find(filter).sort({ createdAt: -1 }).limit(parseInt(limit));
    res.json({ data: subscribers, count: subscribers.length });
  } catch (err) {
    next(err);
  }
};
