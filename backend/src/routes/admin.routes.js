const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const {
  getDashboardStats,
  getDashboard,
  getAdminProducts,
  getAdminCustomers,
} = require('../controllers/admin.controller');

const adminAuth = [requireAuth, checkRole('admin', 'super_admin')];

router.get('/analytics', ...adminAuth, getDashboardStats);
router.get('/dashboard', ...adminAuth, getDashboard);
router.get('/products', ...adminAuth, getAdminProducts);
router.get('/customers', ...adminAuth, getAdminCustomers);

module.exports = router;
