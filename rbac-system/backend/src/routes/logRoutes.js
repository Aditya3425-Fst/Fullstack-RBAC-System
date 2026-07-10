const express = require('express');
const router = express.Router();
const { getLogs, getLoginLogs } = require('../controllers/logController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// All log routes require authentication
router.use(authenticate);

// GET /logs - SUPER_ADMIN, ADMIN
router.get('/', authorize('SUPER_ADMIN', 'ADMIN'), getLogs);

// GET /logs/login - SUPER_ADMIN, ADMIN
router.get('/login', authorize('SUPER_ADMIN', 'ADMIN'), getLoginLogs);

module.exports = router;
