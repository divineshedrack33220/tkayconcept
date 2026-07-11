const express = require('express');
const router = express.Router();
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

// Public
router.get('/', getPublishedPosts);
router.get('/:slug', getPostBySlug);

// Admin
router.get('/admin/all', requireAuth, checkRole('admin', 'super_admin', 'content_manager'), getAllPosts);
router.post('/admin', requireAuth, checkRole('admin', 'super_admin', 'content_manager'), createPost);
router.put('/admin/:id', requireAuth, checkRole('admin', 'super_admin', 'content_manager'), updatePost);
router.delete('/admin/:id', requireAuth, checkRole('admin', 'super_admin', 'content_manager'), deletePost);

module.exports = router;
