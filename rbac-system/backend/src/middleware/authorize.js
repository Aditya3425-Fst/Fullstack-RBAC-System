const { sendError } = require('../utils/response');
const { createLog } = require('../services/logService');
const { ACTIONS, STATUS } = require('../constants/actions');

/**
 * RBAC Authorization Middleware Factory.
 * Usage: authorize('SUPER_ADMIN', 'ADMIN')
 */
const authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return sendError(res, 'Authentication required.', 401);
      }

      if (!allowedRoles.includes(user.role)) {
        // Log access denial
        await createLog({
          userId: user._id,
          mobile: user.mobile,
          action: ACTIONS.ACCESS_DENIED,
          status: STATUS.FAILURE,
          message: `Access denied for role ${user.role} on ${req.method} ${req.originalUrl}`,
          ipAddress: req.ip || req.socket?.remoteAddress || 'unknown',
          userAgent: req.headers['user-agent'] || 'unknown',
        });

        return sendError(
          res,
          `Access denied. Required role(s): ${allowedRoles.join(', ')}`,
          403
        );
      }

      next();
    } catch (error) {
      return sendError(res, 'Authorization check failed.', 500);
    }
  };
};

module.exports = authorize;
