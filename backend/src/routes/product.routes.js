const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');
const {
  getProducts,
  getProductById,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getFeaturedProducts,
  getNewArrivals,
  getBestSellers,
  getAllProductsAdmin,
} = require('../controllers/product.controller');

const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
  body('category').isMongoId().withMessage('Valid category ID is required'),
  body('description').optional().trim(),
  body('shortDescription').optional().trim(),
  body('compareAtPrice').optional({ nullable: true }).isFloat({ min: 0 }),
  body('brand').optional().isIn(['TK Concepts', 'Rooted Identity']),
  body('stock').optional().isInt({ min: 0 }),
  body('sku').optional().trim(),
  body('tags').optional().isArray(),
  body('isFeatured').optional().isBoolean(),
  body('isNewArrival').optional().isBoolean(),
  body('isBestSeller').optional().isBoolean(),
  body('isActive').optional().isBoolean(),
];

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/best-sellers', getBestSellers);
router.get('/admin', requireAuth, isAdmin, getAllProductsAdmin);
router.get('/:id/related', getRelatedProducts);
router.get('/:id', getProductById);
router.get('/slug/:slug', getProductBySlug);
router.post('/', requireAuth, isAdmin, productValidation, validate, createProduct);
router.put('/:id', requireAuth, isAdmin, productValidation, validate, updateProduct);
router.delete('/:id', requireAuth, isAdmin, deleteProduct);
router.patch('/:id/stock', requireAuth, isAdmin, updateStock);

module.exports = router;
