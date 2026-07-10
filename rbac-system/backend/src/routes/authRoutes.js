const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP, register } = require('../controllers/authController');
const { sendOTPValidator, verifyOTPValidator, registerValidator } = require('../validators/authValidators');
const validate = require('../middleware/validate');
const { otpLimiter, authLimiter } = require('../middleware/rateLimiter');

// POST /auth/send-otp  — works for any mobile number
router.post('/send-otp', otpLimiter, sendOTPValidator, validate, sendOTP);

// POST /auth/verify-otp  — verify OTP, returns isNewUser flag for new numbers
router.post('/verify-otp', authLimiter, verifyOTPValidator, validate, verifyOTP);

// POST /auth/register  — called after OTP verified for new users
router.post('/register', authLimiter, registerValidator, validate, register);

module.exports = router;
