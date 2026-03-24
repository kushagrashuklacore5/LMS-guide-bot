const express = require('express');
const { register, login, getProfile } = require('../controllers/auth-controller');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

module.exports = router;
