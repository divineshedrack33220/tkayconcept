const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const User = require('../models/User');
const Wishlist = require('../models/Wishlist');

// GET /api/wishlist - Get current user's wishlist
router.get('/', requireAuth, async (req, res) => {
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
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Failed to get wishlist' });
  }
});

// POST /api/wishlist/:productId - Add to wishlist
router.post('/:productId', requireAuth, async (req, res) => {
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
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Failed to add to wishlist' });
  }
});

// DELETE /api/wishlist/:productId - Remove from wishlist
router.delete('/:productId', requireAuth, async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.user.sub }).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    await Wishlist.findOneAndDelete({ user: user._id, product: req.params.productId });
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Failed to remove from wishlist' });
  }
});

// GET /api/wishlist/check/:productId - Check if product is in wishlist
router.get('/check/:productId', requireAuth, async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.user.sub }).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const exists = await Wishlist.findOne({ user: user._id, product: req.params.productId }).select('_id').lean();
    res.json({ data: { isWishlisted: !!exists } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to check wishlist' });
  }
});

module.exports = router;
