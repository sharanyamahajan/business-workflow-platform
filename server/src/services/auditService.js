const { db } = require('../db/schema');

function logAudit({ requestId, actorId, action, previousStatus = null, newStatus = null, previousStageId = null, newStageId = null, details = {} }) {
  try {
    const stmt = db.prepare(`
      INSERT INTO audit_logs 
      (request_id, actor_id, action, previous_status, new_status, previous_stage_id, new_stage_id, details_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      requestId,
      actorId,
      action,
      previousStatus,
      newStatus,
      previousStageId,
      newStageId,
      JSON.stringify(details)
    );
  } catch (err) {
    console.error('Failed to log audit event:', err);
  }
}

function getAuditTrail(requestId) {
  return db.prepare(`
    SELECT 
      a.id, a.request_id, a.action, a.previous_status, a.new_status,
      a.details_json, a.created_at,
      u.full_name AS actor_name, u.email AS actor_email, r.name AS actor_role
    FROM audit_logs a
    JOIN users u ON a.actor_id = u.id
    JOIN roles r ON u.role_id = r.id
    WHERE a.request_id = ?
    ORDER BY a.created_at ASC
  `).all(requestId);
}

module.exports = { logAudit, getAuditTrail };
