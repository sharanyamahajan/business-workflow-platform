const { db } = require('../db/schema');
const { logAudit } = require('../services/auditService');

function addComment(req, res) {
  const { id } = req.params;
  const { content, is_internal } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Comment content cannot be empty.' });
  }

  const result = db.prepare(`
    INSERT INTO comments (request_id, user_id, content, is_internal)
    VALUES (?, ?, ?, ?)
  `).run(id, req.user.id, content.trim(), is_internal ? 1 : 0);

  logAudit({
    requestId: id,
    actorId: req.user.id,
    action: 'COMMENT_ADDED',
    details: { contentSnippet: content.substring(0, 50) }
  });

  const created = db.prepare(`
    SELECT 
      c.*, u.full_name AS user_name, r.name AS user_role, d.code AS user_dept
    FROM comments c
    JOIN users u ON c.user_id = u.id
    JOIN roles r ON u.role_id = r.id
    JOIN departments d ON u.department_id = d.id
    WHERE c.id = ?
  `).get(result.lastInsertRowid);

  return res.status(201).json({ comment: created });
}

module.exports = { addComment };
