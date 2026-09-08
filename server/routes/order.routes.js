const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const ctrl = require('../controllers/order.controller');

const { releaseEscrowPayouts } = require('../jobs/releaseEscrow');


router.post('/admin/run-escrow-release', auth, roleCheck('admin'), async (req, res) => {
  await releaseEscrowPayouts();
  res.json({ message: 'Escrow release job ran' });
});

router.post('/checkout', auth, roleCheck('buyer'), ctrl.checkout);
router.post('/:orderId/confirm-payment', auth, roleCheck('buyer'), ctrl.confirmPayment);
router.get('/mine', auth, roleCheck('buyer'), ctrl.getMyOrders);
router.get('/vendor/mine', auth, roleCheck('vendor'), ctrl.getVendorOrders);
router.get('/:orderId', auth, ctrl.getOrderById);

router.patch('/:orderId/ship', auth, roleCheck('vendor'), ctrl.markShipped);
router.patch('/:orderId/confirm-delivery', auth, roleCheck('buyer'), ctrl.confirmDelivery);
router.patch('/:orderId/dispute', auth, roleCheck('buyer'), ctrl.raiseDispute);
router.patch('/:orderId/resolve-dispute', auth, roleCheck('admin'), ctrl.resolveDispute);

router.get('/admin/all', auth, roleCheck('admin'), ctrl.getAllOrdersAdmin);

module.exports = router;
