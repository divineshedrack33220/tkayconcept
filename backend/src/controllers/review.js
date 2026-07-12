const Review = require('../models/Review');
const Product = require('../models/Product');

async function updateProductRating(productId) {
  const stats = await Review.aggregate([
    { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(productId), isApproved: true } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await Product.findByIdAndUpdate(productId, {
    averageRating: stats[0] ? Math.round(stats[0].avg * 10) / 10 : 0,
    totalReviews: stats[0] ? stats[0].count : 0,
  });
}

exports.listByProduct = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const filter = { product: req.params.productId, isApproved: true };
    const [reviews, total] = await Promise.all([
      Review.find(filter).populate('user', 'firstName lastName avatar').sort({ createdAt: -1 }).limit(parseInt(limit)).skip((parseInt(page) - 1) * parseInt(limit)),
      Review.countDocuments(filter),
    ]);
    res.json({ data: reviews, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const existing = await Review.findOne({ product: req.params.productId, user: req.user._id });
    if (existing) return res.status(400).json({ error: 'You have already reviewed this product' });
    const review = new Review({ ...req.body, product: req.params.productId, user: req.user._id });
    await review.save();
    await updateProductRating(req.params.productId);
    res.status(201).json({ data: review });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!review) return res.status(404).json({ error: 'Review not found' });
    await updateProductRating(review.product.toString());
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listAll = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const reviews = await Review.find().populate('user', 'firstName lastName').populate('product', 'name').sort({ createdAt: -1 }).limit(parseInt(limit));
    res.json({ data: reviews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
