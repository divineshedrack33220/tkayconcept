const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const ctrl = require('../controllers/review');

router.get('/product/:productId', ctrl.listByProduct);
router.post('/product/:productId', requireAuth, ctrl.create);
router.delete('/:id', requireAuth, ctrl.delete);
router.get('/', ctrl.listAll);

module.exports = router;
