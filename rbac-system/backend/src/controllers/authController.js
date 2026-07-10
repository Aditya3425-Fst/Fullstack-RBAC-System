const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

/**
 * POST /auth/send-otp
 */
const sendOTP = asyncHandler(async (req, res) => {
  const { mobile } = req.body;
  const ipAddress = req.ip || req.socket?.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  const result = await authService.sendOTP({ mobile, ipAddress, userAgent });

  return sendSuccess(res, result, 'OTP sent successfully.', 200);
});

/**
 * POST /auth/verify-otp
 * Returns token+user for existing users.
 * Returns isNewUser:true for new mobile numbers.
 */
const verifyOTP = asyncHandler(async (req, res) => {
  const { mobile, otp } = req.body;
  const ipAddress = req.ip || req.socket?.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  const result = await authService.verifyOTP({ mobile, otp, ipAddress, userAgent });

  return sendSuccess(res, result, result.isNewUser ? 'OTP verified. Please complete registration.' : 'Login successful.', 200);
});

/**
 * POST /auth/register
 * Called after OTP verification for new users.
 * Body: { mobile, name, role }
 */
const register = asyncHandler(async (req, res) => {
  const { mobile, name, role } = req.body;
  const ipAddress = req.ip || req.socket?.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  const result = await authService.registerAndLogin({ mobile, name, role, ipAddress, userAgent });

  return sendSuccess(res, result, 'Registration successful. Welcome!', 201);
});

module.exports = { sendOTP, verifyOTP, register };
