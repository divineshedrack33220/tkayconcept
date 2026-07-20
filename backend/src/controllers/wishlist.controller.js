const User = require('../models/User');
const Wishlist = require('../models/Wishlist');

const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findOne({ clerkId: req.user.sub }).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const items = await Wishlist.find({ user: user._id })
      .populate({
        path: 'product',
        populate: { path: 'category', select: 'name slug' },
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ data: items.map((item) => item.product) });
  } catch (error) {
    next(error);
  }
};

const addToWishlist = async (req, res, next) => {
  try {
    const user = await User.findOne({ clerkId: req.user.sub }).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const existing = await Wishlist.findOne({ user: user._id, product: req.params.productId });
    if (existing) {
      return res.json({ message: 'Already in wishlist', data: existing });
    }

    const item = await Wishlist.create({ user: user._id, product: req.params.productId });
    res.status(201).json({ data: item, message: 'Added to wishlist' });
  } catch (error) {
    next(error);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const user = await User.findOne({ clerkId: req.user.sub }).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    await Wishlist.findOneAndDelete({ user: user._id, product: req.params.productId });
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    next(error);
  }
};

const checkWishlist = async (req, res, next) => {
  try {
    const user = await User.findOne({ clerkId: req.user.sub }).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const exists = await Wishlist.findOne({ user: user._id, product: req.params.productId }).select('_id').lean();
    res.json({ data: { isWishlisted: !!exists } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
};
