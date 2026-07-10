const { verifyToken } = require('../utils/jwtHelper');
const User = require('../models/User');
const { sendError } = require('../utils/response');

/**
 * JWT Authentication Middleware.
 * Verifies Bearer token, decodes payload, attaches user to req.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication required. Please login.', 401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return sendError(res, 'Authentication token missing.', 401);
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 'Session expired. Please login again.', 401);
      }
      if (err.name === 'JsonWebTokenError') {
        return sendError(res, 'Invalid authentication token.', 401);
      }
      return sendError(res, 'Token verification failed.', 401);
    }

    // Fetch fresh user data from DB
    const user = await User.findById(decoded.userId).lean();

    if (!user) {
      return sendError(res, 'User account not found.', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Your account has been deactivated.', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 'Authentication failed.', 401);
  }
};

module.exports = authenticate;
