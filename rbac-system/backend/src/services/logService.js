const Log = require('../models/Log');
const logger = require('../utils/logger');

/**
 * Creates an audit log entry in the database.
 */
const createLog = async ({ userId, mobile, action, status, message, ipAddress, userAgent }) => {
  try {
    const log = await Log.create({
      userId: userId || null,
      mobile: mobile || null,
      action,
      status,
      message,
      ipAddress: ipAddress || 'unknown',
      userAgent: userAgent || 'unknown',
    });
    return log;
  } catch (error) {
    // Log to file but don't throw — logging should never break the app
    logger.error('Failed to create audit log', { error: error.message, action, mobile });
  }
};

/**
 * Retrieves all logs with pagination, search, sorting, and filters.
 */
const getLogs = async (query) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    action = '',
    status = '',
    startDate = '',
    endDate = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const filter = {};

  if (action) filter.action = action;
  if (status) filter.status = status;

  if (search) {
    filter.$or = [
      { mobile: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } },
    ];
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const sortObj = {};
  sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const [logs, total] = await Promise.all([
    Log.find(filter)
      .populate('userId', 'name mobile role')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Log.countDocuments(filter),
  ]);

  return {
    logs,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

/**
 * Retrieves only login-related logs (LOGIN_SUCCESS, LOGIN_FAILED).
 */
const getLoginLogs = async (query) => {
  const loginActions = ['LOGIN_SUCCESS', 'LOGIN_FAILED', 'OTP_VERIFIED', 'OTP_INVALID', 'OTP_EXPIRED'];
  const modifiedQuery = { ...query };

  // If no specific action filter, restrict to login actions
  if (!modifiedQuery.action) {
    modifiedQuery.actionIn = loginActions;
  }

  const {
    page = 1,
    limit = 10,
    search = '',
    status = '',
    startDate = '',
    endDate = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    actionIn,
  } = modifiedQuery;

  const filter = {};

  if (actionIn) {
    filter.action = { $in: actionIn };
  } else if (modifiedQuery.action) {
    filter.action = modifiedQuery.action;
  }

  if (status) filter.status = status;

  if (search) {
    filter.$or = [
      { mobile: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } },
    ];
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const sortObj = {};
  sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const [logs, total] = await Promise.all([
    Log.find(filter)
      .populate('userId', 'name mobile role')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Log.countDocuments(filter),
  ]);

  return {
    logs,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

module.exports = { createLog, getLogs, getLoginLogs };
