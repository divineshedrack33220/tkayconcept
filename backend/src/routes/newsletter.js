const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/newsletter');
const { requireAuth } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

router.post('/subscribe', ctrl.subscribe);
router.post('/unsubscribe', ctrl.unsubscribe);
router.get('/', requireAuth, checkRole('admin', 'super_admin'), ctrl.list);

module.exports = router;
