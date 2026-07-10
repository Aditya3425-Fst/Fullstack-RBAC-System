const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendPaginated } = require('../utils/response');

/**
 * GET /users/profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user._id);
  return sendSuccess(res, { user }, 'Profile retrieved successfully.');
});

/**
 * GET /users
 */
const getUsers = asyncHandler(async (req, res) => {
  const { users, pagination } = await userService.getUsers(req.query);
  return sendPaginated(res, { users }, pagination, 'Users retrieved successfully.');
});

/**
 * POST /users
 */
const createUser = asyncHandler(async (req, res) => {
  const meta = {
    ipAddress: req.ip || req.socket?.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
  };
  const user = await userService.createUser(req.body, req.user, meta);
  return sendSuccess(res, { user }, 'User created successfully.', 201);
});

/**
 * PATCH /users/:id/role
 */
const updateRole = asyncHandler(async (req, res) => {
  const meta = {
    ipAddress: req.ip || req.socket?.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
  };
  const user = await userService.updateRole(req.params.id, req.body.role, req.user, meta);
  return sendSuccess(res, { user }, 'Role updated successfully.');
});

/**
 * DELETE /users/:id
 */
const deleteUser = asyncHandler(async (req, res) => {
  const meta = {
    ipAddress: req.ip || req.socket?.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
  };
  const result = await userService.deleteUser(req.params.id, req.user, meta);
  return sendSuccess(res, result, 'User deleted successfully.');
});

module.exports = { getProfile, getUsers, createUser, updateRole, deleteUser };
