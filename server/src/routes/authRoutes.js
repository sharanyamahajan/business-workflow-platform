const express = require('express');
const router = express.Router();
const { login, getCurrentUser, getAllSystemUsers } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', authenticateToken, getCurrentUser);
router.get('/users', authenticateToken, getAllSystemUsers);

module.exports = router;
