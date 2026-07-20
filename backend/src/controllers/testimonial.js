const Testimonial = require('../models/Testimonial');

exports.list = async (req, res, next) => {
  try {
    const { approved, featured, limit = 50 } = req.query;
    const filter = {};
    if (approved !== undefined) filter.isApproved = approved === 'true';
    if (featured !== undefined) filter.isFeatured = featured === 'true';
    const testimonials = await Testimonial.find(filter)
      .populate('product', 'name slug')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    res.json({ data: testimonials, count: testimonials.length });
  } catch (err) {
    next(err);
  }
};

exports.public = async (req, res, next) => {
  try {
    const { limit = 6 } = req.query;
    const testimonials = await Testimonial.find({ isApproved: true })
      .populate('product', 'name slug')
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(parseInt(limit));
    res.json({ data: testimonials });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const testimonial = new Testimonial(req.body);
    await testimonial.save();
    res.status(201).json({ data: testimonial });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!testimonial) return res.status(404).json({ error: 'Testimonial not found' });
    res.json({ data: testimonial });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) return res.status(404).json({ error: 'Testimonial not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};
