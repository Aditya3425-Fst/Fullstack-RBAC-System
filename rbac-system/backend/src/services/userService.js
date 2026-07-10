const User = require('../models/User');
const { createLog } = require('./logService');
const { ACTIONS, STATUS } = require('../constants/actions');
const { ROLES } = require('../constants/roles');

/**
 * Get a user's own profile.
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

/**
 * Get all users with pagination and search.
 */
const getUsers = async (query) => {
  const { page = 1, limit = 10, search = '', role = '', isActive = '' } = query;

  const filter = {};

  if (role) filter.role = role;
  if (isActive !== '') filter.isActive = isActive === 'true';

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { mobile: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

/**
 * Create a new user.
 */
const createUser = async ({ name, mobile, role, isActive }, actorUser, { ipAddress, userAgent }) => {
  const existing = await User.findOne({ mobile });
  if (existing) {
    const err = new Error('A user with this mobile number already exists.');
    err.statusCode = 409;
    throw err;
  }

  const user = await User.create({
    name,
    mobile,
    role: role || ROLES.USER,
    isActive: isActive !== undefined ? isActive : true,
  });

  await createLog({
    userId: actorUser._id,
    mobile: actorUser.mobile,
    action: ACTIONS.USER_CREATED,
    status: STATUS.SUCCESS,
    message: `User created: ${mobile} with role ${role || ROLES.USER} by ${actorUser.mobile}`,
    ipAddress,
    userAgent,
  });

  return user;
};

/**
 * Update a user's role.
 */
const updateRole = async (targetUserId, newRole, actorUser, { ipAddress, userAgent }) => {
  const user = await User.findById(targetUserId);
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  const oldRole = user.role;
  user.role = newRole;
  await user.save();

  await createLog({
    userId: actorUser._id,
    mobile: actorUser.mobile,
    action: ACTIONS.ROLE_UPDATED,
    status: STATUS.SUCCESS,
    message: `Role updated for ${user.mobile}: ${oldRole} → ${newRole} by ${actorUser.mobile}`,
    ipAddress,
    userAgent,
  });

  return user;
};

/**
 * Delete a user by ID.
 */
const deleteUser = async (targetUserId, actorUser, { ipAddress, userAgent }) => {
  const user = await User.findById(targetUserId);
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  // Prevent self-deletion
  if (user._id.toString() === actorUser._id.toString()) {
    const err = new Error('You cannot delete your own account.');
    err.statusCode = 400;
    throw err;
  }

  await User.deleteOne({ _id: targetUserId });

  await createLog({
    userId: actorUser._id,
    mobile: actorUser.mobile,
    action: ACTIONS.USER_DELETED,
    status: STATUS.SUCCESS,
    message: `User deleted: ${user.mobile} by ${actorUser.mobile}`,
    ipAddress,
    userAgent,
  });

  return { message: 'User deleted successfully.' };
};

module.exports = { getProfile, getUsers, createUser, updateRole, deleteUser };
