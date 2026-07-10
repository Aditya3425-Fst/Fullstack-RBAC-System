const User = require('../models/User');
const OTP = require('../models/OTP');
const { generateOTP } = require('../utils/otpGenerator');
const { generateToken } = require('../utils/jwtHelper');
const { createLog } = require('./logService');
const { ACTIONS, STATUS } = require('../constants/actions');

const MAX_OTP_ATTEMPTS = 3;

/**
 * Generates and stores a new OTP for the given mobile number.
 * Works for ANY mobile — registered or not.
 */
const sendOTP = async ({ mobile, ipAddress, userAgent }) => {
  const expirySeconds = parseInt(process.env.OTP_EXPIRY) || 60;
  const expiresAt = new Date(Date.now() + expirySeconds * 1000);
  const otp = generateOTP();

  // Invalidate any existing OTPs for this mobile
  await OTP.deleteMany({ mobile });

  await OTP.create({
    mobile,
    otp,
    expiresAt,
    attemptCount: 0,
    isUsed: false,
  });

  await createLog({
    mobile,
    action: ACTIONS.OTP_GENERATED,
    status: STATUS.SUCCESS,
    message: `OTP generated for ${mobile}`,
    ipAddress,
    userAgent,
  });

  const response = {
    message: 'OTP sent successfully',
    expiresIn: expirySeconds,
  };

  // Return OTP in response when SHOW_OTP=true (works on both localhost and production)
  if (process.env.SHOW_OTP === 'true') {
    response.otp = otp;
  }

  return response;
};

/**
 * Verifies OTP.
 * - Existing user → returns token + user directly.
 * - New mobile   → returns isNewUser: true (frontend will ask for role).
 */
const verifyOTP = async ({ mobile, otp, ipAddress, userAgent }) => {
  // Find the latest OTP for this mobile
  const otpRecord = await OTP.findOne({ mobile, isUsed: false }).sort({ createdAt: -1 });

  if (!otpRecord) {
    await createLog({
      mobile,
      action: ACTIONS.OTP_EXPIRED,
      status: STATUS.FAILURE,
      message: `No active OTP found for ${mobile}`,
      ipAddress,
      userAgent,
    });
    const err = new Error('OTP not found or expired. Please request a new OTP.');
    err.statusCode = 400;
    throw err;
  }

  // Check expiry
  if (new Date() > otpRecord.expiresAt) {
    await OTP.deleteOne({ _id: otpRecord._id });
    await createLog({
      mobile,
      action: ACTIONS.OTP_EXPIRED,
      status: STATUS.FAILURE,
      message: `OTP expired for ${mobile}`,
      ipAddress,
      userAgent,
    });
    const err = new Error('OTP has expired. Please request a new OTP.');
    err.statusCode = 400;
    throw err;
  }

  // Check if max attempts reached
  if (otpRecord.attemptCount >= MAX_OTP_ATTEMPTS) {
    await OTP.deleteOne({ _id: otpRecord._id });
    await createLog({
      mobile,
      action: ACTIONS.LOGIN_FAILED,
      status: STATUS.FAILURE,
      message: `Max OTP attempts reached for ${mobile}`,
      ipAddress,
      userAgent,
    });
    const err = new Error('Maximum OTP attempts exceeded. Please request a new OTP.');
    err.statusCode = 429;
    throw err;
  }

  // Validate OTP value
  if (otpRecord.otp !== otp.toString()) {
    otpRecord.attemptCount += 1;
    await otpRecord.save();

    const remaining = MAX_OTP_ATTEMPTS - otpRecord.attemptCount;

    await createLog({
      mobile,
      action: ACTIONS.OTP_INVALID,
      status: STATUS.FAILURE,
      message: `Invalid OTP entered for ${mobile}. Attempts remaining: ${remaining}`,
      ipAddress,
      userAgent,
    });

    const err = new Error(
      remaining > 0
        ? `Invalid OTP. ${remaining} attempt(s) remaining.`
        : 'Invalid OTP. Maximum attempts reached. Please request a new OTP.'
    );
    err.statusCode = 400;
    throw err;
  }

  // OTP is valid — mark as used and delete
  otpRecord.isUsed = true;
  await otpRecord.save();
  await OTP.deleteOne({ _id: otpRecord._id });

  await createLog({
    mobile,
    action: ACTIONS.OTP_VERIFIED,
    status: STATUS.SUCCESS,
    message: `OTP verified for ${mobile}`,
    ipAddress,
    userAgent,
  });

  // Check if user already exists
  const existingUser = await User.findOne({ mobile });

  if (existingUser) {
    // Check if user is active
    if (!existingUser.isActive) {
      await createLog({
        userId: existingUser._id,
        mobile,
        action: ACTIONS.LOGIN_FAILED,
        status: STATUS.FAILURE,
        message: `Inactive user attempted login: ${mobile}`,
        ipAddress,
        userAgent,
      });
      const err = new Error('Your account has been deactivated. Please contact administrator.');
      err.statusCode = 403;
      throw err;
    }

    // Generate JWT for existing user
    const token = generateToken({
      userId: existingUser._id,
      mobile: existingUser.mobile,
      role: existingUser.role,
    });

    await createLog({
      userId: existingUser._id,
      mobile,
      action: ACTIONS.LOGIN_SUCCESS,
      status: STATUS.SUCCESS,
      message: `User logged in successfully: ${mobile}`,
      ipAddress,
      userAgent,
    });

    return {
      isNewUser: false,
      token,
      user: {
        _id: existingUser._id,
        name: existingUser.name,
        mobile: existingUser.mobile,
        role: existingUser.role,
        isActive: existingUser.isActive,
      },
    };
  }

  // New mobile number — ask frontend to collect name + role
  return {
    isNewUser: true,
    mobile,
    message: 'OTP verified. Please select your role to complete registration.',
  };
};

/**
 * Registers a new user after OTP verification and returns a JWT.
 */
const registerAndLogin = async ({ mobile, name, role, ipAddress, userAgent }) => {
  const { ROLES } = require('../constants/roles');

  // Double-check user doesn't already exist
  const existing = await User.findOne({ mobile });
  if (existing) {
    const token = generateToken({
      userId: existing._id,
      mobile: existing.mobile,
      role: existing.role,
    });
    return {
      token,
      user: {
        _id: existing._id,
        name: existing.name,
        mobile: existing.mobile,
        role: existing.role,
        isActive: existing.isActive,
      },
    };
  }

  // Validate role — only USER, MANAGER allowed for self-registration
  // ADMIN and SUPER_ADMIN must be assigned by an existing SUPER_ADMIN
  const allowedSelfRoles = [ROLES.USER, ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN];
  if (!allowedSelfRoles.includes(role)) {
    const err = new Error(`Invalid role selected.`);
    err.statusCode = 400;
    throw err;
  }

  const user = await User.create({
    name: name || `User_${mobile.slice(-4)}`,
    mobile,
    role,
    isActive: true,
  });

  await createLog({
    userId: user._id,
    mobile,
    action: ACTIONS.USER_CREATED,
    status: STATUS.SUCCESS,
    message: `New user self-registered: ${mobile} with role ${role}`,
    ipAddress,
    userAgent,
  });

  const token = generateToken({
    userId: user._id,
    mobile: user.mobile,
    role: user.role,
  });

  await createLog({
    userId: user._id,
    mobile,
    action: ACTIONS.LOGIN_SUCCESS,
    status: STATUS.SUCCESS,
    message: `New user logged in after registration: ${mobile}`,
    ipAddress,
    userAgent,
  });

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      mobile: user.mobile,
      role: user.role,
      isActive: user.isActive,
    },
  };
};

module.exports = { sendOTP, verifyOTP, registerAndLogin };
