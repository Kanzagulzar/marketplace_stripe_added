const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const ctrl = require('../controllers/product.controller');

// Order matters: /vendor/mine must come before /:id, or Express will
// treat "vendor" as an :id param and hit the wrong handler.
router.get('/vendor/mine', auth, roleCheck('vendor'), ctrl.getMyProducts);

router.get('/', ctrl.getAllProducts);
router.get('/:id', ctrl.getProductById);
router.post('/', auth, roleCheck('vendor'), ctrl.createProduct);
router.patch('/:id', auth, roleCheck('vendor'), ctrl.updateProduct);
router.delete('/:id', auth, roleCheck('vendor'), ctrl.deleteProduct);

module.exports = router;