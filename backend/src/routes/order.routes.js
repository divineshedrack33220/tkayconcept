const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/order.controller');

// User routes
router.post('/', requireAuth, createOrder);
router.get('/', requireAuth, getMyOrders);
router.get('/:orderId', requireAuth, getOrder);

// Admin routes
router.get('/admin/all', requireAuth, checkRole('admin', 'super_admin'), getAllOrders);
router.put('/admin/:orderId/status', requireAuth, checkRole('admin', 'super_admin'), updateOrderStatus);

module.exports = router;
