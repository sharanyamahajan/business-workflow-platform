const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getNotifications, handleMarkAsRead } = require('../controllers/notificationController');

router.get('/', authenticateToken, getNotifications);
router.patch('/:id/read', authenticateToken, handleMarkAsRead);

module.exports = router;
