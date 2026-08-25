const { db } = require('../db/schema');
const { getRequestDetails, processWorkflowAction, softDeleteRequest } = require('../services/workflowEngine');
const { calculateSlaState } = require('../services/slaService');
const { logAudit, getAuditTrail } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');

function getRequests(req, res) {
  const user = req.user;
  const { search, request_type_id, status, priority, department_id, sla_status, scope } = req.query;

  let query = `
    SELECT 
      r.*,
      rt.code AS request_type_code, rt.name AS request_type_name, rt.target_sla_hours,
      ws.stage_order, ws.stage_code, ws.stage_name, ws.assigned_role_code,
      u.full_name AS requester_name, u.email AS requester_email,
      d.name AS requester_dept_name, d.code AS requester_dept_code,
      assignee.full_name AS assignee_name
    FROM requests r
    JOIN request_types rt ON r.request_type_id = rt.id
    JOIN workflow_stages ws ON r.current_stage_id = ws.id
    JOIN users u ON r.requester_id = u.id
    JOIN departments d ON r.requester_dept_id = d.id
    LEFT JOIN users assignee ON r.current_assignee_id = assignee.id
    WHERE r.is_archived = 0
  `;
  const params = [];

  // Scope authorization filtering
  if (user.role_code === 'EMPLOYEE' || scope === 'my_requests') {
    query += ` AND (r.requester_id = ? OR r.current_assignee_id = ?)`;
    params.push(user.id, user.id);
  } else if (user.role_code === 'REPORTING_MANAGER') {
    if (scope === 'my_requests') {
      query += ` AND r.requester_id = ?`;
      params.push(user.id);
    } else if (scope === 'pending_approval') {
      query += ` AND (r.current_assignee_id = ? OR (r.requester_dept_id = ? AND ws.assigned_role_code = 'REPORTING_MANAGER' AND r.status = 'APPROVAL_PENDING'))`;
      params.push(user.id, user.department_id);
    } else {
      query += ` AND (r.requester_id = ? OR r.requester_dept_id = ? OR r.current_assignee_id = ?)`;
      params.push(user.id, user.department_id, user.id);
    }
  } else if (user.role_code === 'DEPARTMENT_STAFF') {
    if (scope === 'my_requests') {
      query += ` AND r.requester_id = ?`;
      params.push(user.id);
    } else if (scope === 'dept_queue') {
      query += ` AND r.current_dept_id = ?`;
      params.push(user.department_id);
    } else {
      query += ` AND (r.requester_id = ? OR r.current_dept_id = ? OR r.current_assignee_id = ?)`;
      params.push(user.id, user.department_id, user.id);
    }
  } else if (user.role_code === 'DEPARTMENT_HEAD') {
    query += ` AND (r.requester_id = ? OR r.requester_dept_id = ? OR ws.assigned_role_code = 'DEPARTMENT_HEAD')`;
    params.push(user.id, user.department_id);
  }

  // Server-side SQL Query Filters
  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    query += ` AND (r.request_number LIKE ? OR r.title LIKE ? OR u.full_name LIKE ?)`;
    params.push(term, term, term);
  }

  if (request_type_id) {
    query += ` AND r.request_type_id = ?`;
    params.push(request_type_id);
  }

  if (status) {
    query += ` AND r.status = ?`;
    params.push(status);
  }

  if (priority) {
    query += ` AND r.priority = ?`;
    params.push(priority);
  }

  if (department_id) {
    query += ` AND r.requester_dept_id = ?`;
    params.push(department_id);
  }

  query += ` ORDER BY r.submitted_at DESC`;

  const rawRequests = db.prepare(query).all(...params);

  // Dynamic SLA Enriching
  const enriched = rawRequests.map(r => {
    const slaState = calculateSlaState(r.submitted_at, r.target_sla_at, r.completed_at, r.target_sla_hours);
    return {
      ...r,
      form_data: JSON.parse(r.form_data || '{}'),
      sla: slaState
    };
  });

  if (sla_status) {
    const filtered = enriched.filter(r => r.sla.code === sla_status);
    return res.json({ requests: filtered, count: filtered.length });
  }

  return res.json({ requests: enriched, count: enriched.length });
}

function createRequest(req, res) {
  const user = req.user;
  const { request_type_id, title, priority, required_date, form_data } = req.body;

  if (!request_type_id || !title || !form_data) {
    return res.status(400).json({ error: 'Request type, title, and form data are required.' });
  }

  const reqType = db.prepare(`SELECT * FROM request_types WHERE id = ?`).get(request_type_id);
  if (!reqType) {
    return res.status(404).json({ error: 'Invalid request type selected.' });
  }

  const stages = db.prepare(`
    SELECT * FROM workflow_stages WHERE request_type_id = ? ORDER BY stage_order ASC
  `).all(request_type_id);

  if (!stages || stages.length === 0) {
    return res.status(400).json({ error: 'No workflow stages configured for this request type.' });
  }

  const now = new Date();
  const slaTarget = new Date(now.getTime() + reqType.target_sla_hours * 3600 * 1000).toISOString();

  const countRow = db.prepare(`SELECT COUNT(*) as cnt FROM requests`).get();
  const seq = (countRow.cnt + 1).toString().padStart(5, '0');
  const reqNumber = `REQ-2026-${seq}`;

  const initialStage = stages.length > 1 ? stages[1] : stages[0];
  const initialStatus = 'APPROVAL_PENDING';

  let assigneeId = null;
  let currentDeptId = user.department_id;

  if (initialStage.assigned_role_code === 'REPORTING_MANAGER') {
    assigneeId = user.manager_id || null;
  } else if (initialStage.assigned_role_code === 'DEPARTMENT_STAFF') {
    currentDeptId = initialStage.specific_dept_id || user.department_id;
  }

  const insertStmt = db.prepare(`
    INSERT INTO requests 
    (request_number, request_type_id, requester_id, requester_dept_id, current_stage_id, status, priority, current_assignee_id, current_dept_id, title, form_data, required_date, target_sla_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = insertStmt.run(
    reqNumber,
    request_type_id,
    user.id,
    user.department_id,
    initialStage.id,
    initialStatus,
    priority || 'MEDIUM',
    assigneeId,
    currentDeptId,
    title,
    JSON.stringify(form_data),
    required_date || null,
    slaTarget
  );

  const requestId = result.lastInsertRowid;

  logAudit({
    requestId,
    actorId: user.id,
    action: 'SUBMITTED',
    newStatus: initialStatus,
    newStageId: initialStage.id,
    details: { message: `Request ${reqNumber} submitted by ${user.full_name}` }
  });

  if (assigneeId) {
    createNotification({
      userId: assigneeId,
      requestId,
      type: 'APPROVAL_REQUIRED',
      title: 'Action Required: Pending Approval',
      message: `${user.full_name} submitted request ${reqNumber} requiring your review.`
    });
  }

  const createdRequest = getRequestDetails(requestId);
  return res.status(201).json({ request: createdRequest });
}

function getRequestById(req, res) {
  const { id } = req.params;
  const user = req.user;
  const request = getRequestDetails(id);

  if (!request) {
    return res.status(404).json({ error: 'Request not found.' });
  }

  // Cross-user authorization scope check
  if (
    user.role_code !== 'SYSTEM_ADMIN' &&
    user.role_code !== 'OPERATIONS_MANAGER' &&
    request.requester_id !== user.id &&
    request.requester_dept_id !== user.department_id &&
    request.current_assignee_id !== user.id
  ) {
    return res.status(403).json({ error: 'Access denied: You are not authorized to view this request.' });
  }

  const stages = db.prepare(`
    SELECT * FROM workflow_stages
    WHERE request_type_id = ?
    ORDER BY stage_order ASC
  `).all(request.request_type_id);

  const approvals = db.prepare(`
    SELECT 
      a.*, u.full_name AS actor_name, r.name AS actor_role, ws.stage_name
    FROM approvals a
    JOIN users u ON a.actor_id = u.id
    JOIN roles r ON u.role_id = r.id
    JOIN workflow_stages ws ON a.stage_id = ws.id
    WHERE a.request_id = ?
    ORDER BY a.created_at ASC
  `).all(id);

  const comments = db.prepare(`
    SELECT 
      c.*, u.full_name AS user_name, r.name AS user_role, d.code AS user_dept
    FROM comments c
    JOIN users u ON c.user_id = u.id
    JOIN roles r ON u.role_id = r.id
    JOIN departments d ON u.department_id = d.id
    WHERE c.request_id = ?
    ORDER BY c.created_at ASC
  `).all(id);

  const attachments = db.prepare(`
    SELECT a.*, u.full_name AS uploader_name
    FROM attachments a
    JOIN users u ON a.uploaded_by_id = u.id
    WHERE a.request_id = ?
    ORDER BY a.created_at DESC
  `).all(id);

  const auditTrail = getAuditTrail(id);
  const slaState = calculateSlaState(request.submitted_at, request.target_sla_at, request.completed_at, request.target_sla_hours);

  return res.json({
    request: {
      ...request,
      form_data: JSON.parse(request.form_data || '{}'),
      sla: slaState
    },
    stages,
    approvals,
    comments,
    attachments,
    auditTrail
  });
}

function handleWorkflowAction(req, res) {
  const { id } = req.params;
  const { action, comments, reason, version, expected_version } = req.body;

  if (!action) {
    return res.status(400).json({ error: 'Workflow action is required.' });
  }

  try {
    const updated = processWorkflowAction(id, req.user, action, { 
      comments, 
      reason,
      expectedVersion: version !== undefined ? version : expected_version
    });
    return res.json({ message: `Action ${action} completed successfully.`, request: updated });
  } catch (err) {
    if (err.message.includes('Concurrency Conflict')) {
      return res.status(409).json({ error: err.message });
    }
    return res.status(400).json({ error: err.message });
  }
}

function handleDeleteRequest(req, res) {
  const { id } = req.params;
  try {
    const result = softDeleteRequest(id, req.user);
    return res.json({ message: 'Request soft deleted successfully.', ...result });
  } catch (err) {
    return res.status(403).json({ error: err.message });
  }
}

function reassignRequest(req, res) {
  const { id } = req.params;
  const { assignee_id, department_id } = req.body;

  const request = getRequestDetails(id);
  if (!request) {
    return res.status(404).json({ error: 'Request not found.' });
  }

  db.prepare(`
    UPDATE requests SET current_assignee_id = ?, current_dept_id = ? WHERE id = ? AND is_archived = 0
  `).run(assignee_id || request.current_assignee_id, department_id || request.current_dept_id, id);

  logAudit({
    requestId: id,
    actorId: req.user.id,
    action: 'REASSIGNED',
    details: { assignee_id, department_id }
  });

  return res.json({ message: 'Request reassigned successfully.' });
}

module.exports = {
  getRequests,
  createRequest,
  getRequestById,
  handleWorkflowAction,
  handleDeleteRequest,
  reassignRequest
};
