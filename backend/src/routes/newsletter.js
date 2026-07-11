const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/newsletter');

router.post('/subscribe', ctrl.subscribe);
router.post('/unsubscribe', ctrl.unsubscribe);
router.get('/', ctrl.list);

module.exports = router;
