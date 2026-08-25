const bcrypt = require('bcryptjs');
const { db } = require('../db/schema');

function getSystemOverview(req, res) {
  const roles = db.prepare(`SELECT * FROM roles`).all();
  const departments = db.prepare(`
    SELECT d.*, u1.full_name AS manager_name, u2.full_name AS director_name
    FROM departments d
    LEFT JOIN users u1 ON d.manager_id = u1.id
    LEFT JOIN users u2 ON d.director_id = u2.id
  `).all();
  const requestTypes = db.prepare(`SELECT * FROM request_types`).all();
  const workflowStages = db.prepare(`
    SELECT ws.*, rt.code AS request_type_code, rt.name AS request_type_name
    FROM workflow_stages ws
    JOIN request_types rt ON ws.request_type_id = rt.id
    ORDER BY ws.request_type_id, ws.stage_order ASC
  `).all();

  return res.json({
    roles,
    departments,
    requestTypes: requestTypes.map(rt => ({ ...rt, form_schema: JSON.parse(rt.form_schema || '{}') })),
    workflowStages
  });
}

function createUser(req, res) {
  const { email, password, full_name, role_id, department_id, manager_id } = req.body;

  if (!email || !password || !full_name || !role_id || !department_id) {
    return res.status(400).json({ error: 'All mandatory fields (email, password, name, role, dept) are required.' });
  }

  const existing = db.prepare(`SELECT id FROM users WHERE email = ?`).get(email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'A user with this email address already exists.' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  const result = db.prepare(`
    INSERT INTO users (email, password_hash, full_name, role_id, department_id, manager_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(email.toLowerCase(), passwordHash, full_name, role_id, department_id, manager_id || null);

  const createdUser = db.prepare(`
    SELECT u.id, u.email, u.full_name, r.name AS role_name, d.name AS dept_name
    FROM users u
    JOIN roles r ON u.role_id = r.id
    JOIN departments d ON u.department_id = d.id
    WHERE u.id = ?
  `).get(result.lastInsertRowid);

  return res.status(201).json({ user: createdUser, message: 'User created successfully.' });
}

function updateSlaTarget(req, res) {
  const { typeId } = req.params;
  const { target_sla_hours } = req.body;

  if (!target_sla_hours || target_sla_hours <= 0) {
    return res.status(400).json({ error: 'Valid target SLA hours required.' });
  }

  db.prepare(`UPDATE request_types SET target_sla_hours = ? WHERE id = ?`).run(target_sla_hours, typeId);

  return res.json({ message: 'SLA Target updated successfully.' });
}

module.exports = {
  getSystemOverview,
  createUser,
  updateSlaTarget
};
