const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getSystemOverview, createUser, updateSlaTarget } = require('../controllers/adminController');

// Middleware to ensure admin or ops manager role
function requireAdminOrOps(req, res, next) {
  if (!['SYSTEM_ADMIN', 'OPERATIONS_MANAGER'].includes(req.user.role_code)) {
    return res.status(403).json({ error: 'Access denied. Administrative privileges required.' });
  }
  next();
}

router.use(authenticateToken, requireAdminOrOps);

router.get('/overview', getSystemOverview);
router.post('/users', createUser);
router.patch('/request-types/:typeId/sla', updateSlaTarget);

module.exports = router;
