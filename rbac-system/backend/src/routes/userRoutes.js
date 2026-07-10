const express = require('express');
const router = express.Router();
const { getProfile, getUsers, createUser, updateRole, deleteUser } = require('../controllers/userController');
const { createUserValidator, updateRoleValidator, deleteUserValidator } = require('../validators/userValidators');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// All user routes require authentication
router.use(authenticate);

// GET /users/profile - All authenticated users
router.get('/profile', getProfile);

// GET /users - SUPER_ADMIN, ADMIN, MANAGER
router.get('/', authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER'), getUsers);

// POST /users - SUPER_ADMIN, ADMIN
router.post('/', authorize('SUPER_ADMIN', 'ADMIN'), createUserValidator, validate, createUser);

// PATCH /users/:id/role - SUPER_ADMIN only
router.patch('/:id/role', authorize('SUPER_ADMIN'), updateRoleValidator, validate, updateRole);

// DELETE /users/:id - SUPER_ADMIN only
router.delete('/:id', authorize('SUPER_ADMIN'), deleteUserValidator, validate, deleteUser);

module.exports = router;
