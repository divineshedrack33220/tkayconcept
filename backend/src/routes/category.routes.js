const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');
const {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategoriesAdmin,
  reorderCategories,
} = require('../controllers/category.controller');

const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('description').optional().trim(),
  body('image').optional().trim(),
  body('parent').optional({ nullable: true }).isMongoId().withMessage('Invalid parent category ID'),
  body('sortOrder').optional().isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer'),
];

router.get('/', getCategories);
router.get('/admin', requireAuth, isAdmin, getAllCategoriesAdmin);
router.put('/reorder/admin', requireAuth, isAdmin, reorderCategories);
router.get('/:slug', getCategoryBySlug);
router.post('/', requireAuth, isAdmin, categoryValidation, validate, createCategory);
router.put('/:id', requireAuth, isAdmin, categoryValidation, validate, updateCategory);
router.delete('/:id', requireAuth, isAdmin, deleteCategory);

module.exports = router;
