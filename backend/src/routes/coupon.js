const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const ctrl = require('../controllers/coupon');

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

const couponValidation = [
  body('code').trim().isLength({ min: 3 }).withMessage('Code must be at least 3 characters'),
  body('type').isIn(['percentage', 'fixed']).withMessage('Type must be percentage or fixed'),
  body('value').isFloat({ min: 0.01 }).withMessage('Value must be greater than 0'),
  body('minimumOrder').optional().isFloat({ min: 0 }),
  body('maximumDiscount').optional().isFloat({ min: 0 }),
  body('usageLimit').optional().isInt({ min: 0 }),
];

router.get('/', ctrl.list);
router.get('/validate', ctrl.validate);
router.post('/', requireAuth, checkRole('admin', 'super_admin'), couponValidation, validate, ctrl.create);
router.put('/:id', requireAuth, checkRole('admin', 'super_admin'), couponValidation, validate, ctrl.update);
router.delete('/:id', requireAuth, checkRole('admin', 'super_admin'), ctrl.delete);

module.exports = router;
