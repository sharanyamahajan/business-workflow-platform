const jwt = require('jsonwebtoken');
const config = require('../config');
const { db } = require('../db/schema');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Fetch user details with role and department codes
    const user = db.prepare(`
      SELECT 
        u.id, u.email, u.full_name, u.role_id, u.department_id, u.manager_id, u.status,
        r.code AS role_code, r.name AS role_name,
        d.code AS dept_code, d.name AS dept_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      JOIN departments d ON u.department_id = d.id
      WHERE u.id = ?
    `).get(decoded.id);

    if (!user || user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'User inactive or not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { authenticateToken };
