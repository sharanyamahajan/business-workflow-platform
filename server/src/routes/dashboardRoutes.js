const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getDashboardMetrics } = require('../controllers/dashboardController');

router.get('/metrics', authenticateToken, getDashboardMetrics);

module.exports = router;
