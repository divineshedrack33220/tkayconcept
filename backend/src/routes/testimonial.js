const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const ctrl = require('../controllers/testimonial');

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

const testimonialValidation = [
  body('customerName').trim().notEmpty().withMessage('Customer name is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('content').trim().notEmpty().withMessage('Content is required'),
];

router.get('/', ctrl.list);
router.get('/public', ctrl.public);
router.post('/', requireAuth, checkRole('admin', 'super_admin'), testimonialValidation, validate, ctrl.create);
router.put('/:id', requireAuth, checkRole('admin', 'super_admin'), testimonialValidation, validate, ctrl.update);
router.delete('/:id', requireAuth, checkRole('admin', 'super_admin'), ctrl.delete);

module.exports = router;
