const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
} = require('../controllers/wishlist.controller');

router.get('/', requireAuth, getWishlist);
router.post('/:productId', requireAuth, addToWishlist);
router.delete('/:productId', requireAuth, removeFromWishlist);
router.get('/check/:productId', requireAuth, checkWishlist);

module.exports = router;
