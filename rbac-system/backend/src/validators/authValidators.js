const { body } = require('express-validator');
const { ROLES } = require('../constants/roles');

const sendOTPValidator = [
  body('mobile')
    .notEmpty()
    .withMessage('Mobile number is required.')
    .isNumeric()
    .withMessage('Mobile number must be numeric.')
    .isLength({ min: 10, max: 10 })
    .withMessage('Mobile number must be exactly 10 digits.'),
];

const verifyOTPValidator = [
  body('mobile')
    .notEmpty()
    .withMessage('Mobile number is required.')
    .isNumeric()
    .withMessage('Mobile number must be numeric.')
    .isLength({ min: 10, max: 10 })
    .withMessage('Mobile number must be exactly 10 digits.'),
  body('otp')
    .notEmpty()
    .withMessage('OTP is required.')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits.')
    .isNumeric()
    .withMessage('OTP must be numeric.'),
];

const registerValidator = [
  body('mobile')
    .notEmpty()
    .withMessage('Mobile number is required.')
    .isNumeric()
    .withMessage('Mobile number must be numeric.')
    .isLength({ min: 10, max: 10 })
    .withMessage('Mobile number must be exactly 10 digits.'),
  body('name')
    .notEmpty()
    .withMessage('Name is required.')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters.')
    .trim(),
  body('role')
    .notEmpty()
    .withMessage('Role is required.')
    .isIn(Object.values(ROLES))
    .withMessage(`Role must be one of: ${Object.values(ROLES).join(', ')}`),
];

module.exports = { sendOTPValidator, verifyOTPValidator, registerValidator };
