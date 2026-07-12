const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const {
  getPublishedPosts,
  getPostBySlug,
  getAllPosts,
  createPost,
  updatePost,
  deletePost,
} = require('../controllers/blog.controller');

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

const blogValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('excerpt').optional().trim(),
  body('content').optional().trim(),
  body('category').isIn(['faith', 'purpose', 'identity', 'books', 'culture', 'games', 'community']).withMessage('Invalid category'),
  body('status').optional().isIn(['draft', 'published', 'scheduled']),
  body('tags').optional().isArray(),
];

// Public
router.get('/', getPublishedPosts);
router.get('/:slug', getPostBySlug);

// Admin
router.get('/admin/all', requireAuth, checkRole('admin', 'super_admin', 'content_manager'), getAllPosts);
router.post('/admin', requireAuth, checkRole('admin', 'super_admin', 'content_manager'), blogValidation, validate, createPost);
router.put('/admin/:id', requireAuth, checkRole('admin', 'super_admin', 'content_manager'), blogValidation, validate, updatePost);
router.delete('/admin/:id', requireAuth, checkRole('admin', 'super_admin', 'content_manager'), deletePost);

module.exports = router;
