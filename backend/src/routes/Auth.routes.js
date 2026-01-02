const express = require('express');
const router = express.Router();
const { authController } = require('../controllers/index.js');
const { protect, validateLogin } = require('../middleware');

router.post('/login', validateLogin, authController.login);

router.post('/refresh', authController.refreshToken);

router.post('/logout', protect, authController.logout);

router.get('/me', protect, authController.getMe);

module.exports = router;