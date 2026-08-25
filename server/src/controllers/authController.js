const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { db } = require('../db/schema');

function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.prepare(`
    SELECT 
      u.*,
      r.code AS role_code, r.name AS role_name,
      d.code AS dept_code, d.name AS dept_name
    FROM users u
    JOIN roles r ON u.role_id = r.id
    JOIN departments d ON u.department_id = d.id
    WHERE LOWER(u.email) = LOWER(?)
  `).get(email);

  if (!user || user.status !== 'ACTIVE') {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role_code },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );

  const { password_hash, ...safeUser } = user;

  return res.json({
    token,
    user: safeUser
  });
}

function getCurrentUser(req, res) {
  const { password_hash, ...safeUser } = req.user;
  return res.json({ user: safeUser });
}

function getAllSystemUsers(req, res) {
  const users = db.prepare(`
    SELECT 
      u.id, u.email, u.full_name, u.status, u.created_at,
      r.code AS role_code, r.name AS role_name,
      d.code AS dept_code, d.name AS dept_name
    FROM users u
    JOIN roles r ON u.role_id = r.id
    JOIN departments d ON u.department_id = d.id
    ORDER BY u.full_name ASC
  `).all();

  return res.json({ users });
}

module.exports = {
  login,
  getCurrentUser,
  getAllSystemUsers
};
