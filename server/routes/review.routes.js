const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const ctrl = require('../controllers/review.controller');

router.post('/', auth, roleCheck('buyer'), ctrl.createReview);
router.get('/product/:productId', ctrl.getProductReviews);
router.get('/order/:orderId/mine', auth, roleCheck('buyer'), ctrl.getReviewedProductIds);

module.exports = router;