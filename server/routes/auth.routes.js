const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/auth.controller');
const csrf = require('../middleware/csrf');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/logout', ctrl.logout);
router.get('/me', auth, ctrl.getMe);
router.get('/csrf', csrf.createToken);

module.exports = router;