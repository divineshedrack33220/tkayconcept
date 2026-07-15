const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  syncUser,
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require('../controllers/user.controller');

// Sync Clerk user to MongoDB (no auth required - called after registration, rate limited)
router.post('/sync', authLimiter, syncUser);

// Profile routes (require auth)
router.get('/me', requireAuth, getProfile);
router.put('/me', requireAuth, updateProfile);

// Address routes (require auth)
router.get('/me/addresses', requireAuth, getAddresses);
router.post('/me/addresses', requireAuth, addAddress);
router.put('/me/addresses/:addressId', requireAuth, updateAddress);
router.delete('/me/addresses/:addressId', requireAuth, deleteAddress);
router.put('/me/addresses/:addressId/default', requireAuth, setDefaultAddress);

module.exports = router;
