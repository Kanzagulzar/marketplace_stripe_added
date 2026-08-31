const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const ctrl = require('../controllers/vendor.controller');

router.post('/', auth, ctrl.createVendorProfile);
router.get('/me', auth, roleCheck('vendor'), ctrl.getMyVendorProfile);
router.get('/onboarding-link', auth, roleCheck('vendor'), ctrl.getOnboardingLink); // new
router.get('/onboarding-status', auth, roleCheck('vendor'), ctrl.checkOnboardingStatus); // new
router.get('/store/:slug', ctrl.getVendorBySlug);

router.get('/', auth, roleCheck('admin'), ctrl.listVendors);
router.patch('/:vendorId/status', auth, roleCheck('admin'), ctrl.updateVendorStatus);

module.exports = router;