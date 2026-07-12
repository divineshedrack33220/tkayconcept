const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/order.controller');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map((err) => ({ field: err.path, message: err.msg })),
    });
  }
  next();
};

const orderCreateValidation = [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.productId').notEmpty().withMessage('Product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shippingAddress').isObject().withMessage('Shipping address is required'),
  body('shippingAddress.street').trim().notEmpty().withMessage('Street is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('shippingAddress.state').trim().notEmpty().withMessage('State is required'),
  body('shippingAddress.zipCode').trim().notEmpty().withMessage('ZIP code is required'),
];

const orderStatusValidation = [
  body('orderStatus').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  body('trackingNumber').optional().trim(),
];

// User routes
router.post('/', requireAuth, orderCreateValidation, validate, createOrder);
router.get('/', requireAuth, getMyOrders);
router.get('/:orderId', requireAuth, getOrder);

// Admin routes
router.get('/admin/all', requireAuth, checkRole('admin', 'super_admin'), getAllOrders);
router.put('/admin/:orderId/status', requireAuth, checkRole('admin', 'super_admin'), orderStatusValidation, validate, updateOrderStatus);

module.exports = router;
