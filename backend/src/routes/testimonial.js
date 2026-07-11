const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/testimonial');

router.get('/', ctrl.list);
router.get('/public', ctrl.public);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.delete);

module.exports = router;
