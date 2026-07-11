const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/coupon');

router.get('/', ctrl.list);
router.get('/validate', ctrl.validate);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.delete);

module.exports = router;
