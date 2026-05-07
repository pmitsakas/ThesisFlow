const express = require('express');
const router = express.Router();
const { authController } = require('../controllers/index.js');
const { protect, validateLogin, validateRegister, validateForgotPassword, validateResetPassword } = require('../middleware');

router.post('/login', validateLogin, authController.login);
router.post('/register', validateRegister, authController.register);
router.post('/verify-otp', authController.verifyOtp);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/reset-password', validateResetPassword, authController.resetPassword);
router.post('/refresh', authController.refreshToken);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;