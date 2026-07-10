const logService = require('../services/logService');
const asyncHandler = require('../utils/asyncHandler');
const { sendPaginated } = require('../utils/response');

/**
 * GET /logs
 */
const getLogs = asyncHandler(async (req, res) => {
  const { logs, pagination } = await logService.getLogs(req.query);
  return sendPaginated(res, { logs }, pagination, 'Logs retrieved successfully.');
});

/**
 * GET /logs/login
 */
const getLoginLogs = asyncHandler(async (req, res) => {
  const { logs, pagination } = await logService.getLoginLogs(req.query);
  return sendPaginated(res, { logs }, pagination, 'Login logs retrieved successfully.');
});

module.exports = { getLogs, getLoginLogs };
