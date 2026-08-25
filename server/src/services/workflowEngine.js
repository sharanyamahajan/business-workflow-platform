const { db } = require('../db/schema');
const { logAudit } = require('./auditService');
const { createNotification } = require('./notificationService');

/**
 * Core Workflow Engine
 * Manages generic stage progression, authorization, approvals, rejections, changes requested routing,
 * optimistic locking concurrency control, and soft-delete retention.
 */

function getRequestDetails(requestId) {
  const req = db.prepare(`
    SELECT 
      r.*,
      rt.code AS request_type_code, rt.name AS request_type_name, rt.target_sla_hours,
      ws.stage_order, ws.stage_code, ws.stage_name, ws.assigned_role_code, ws.assigned_dept_type, ws.specific_dept_id,
      ws.can_approve, ws.can_reject, ws.can_request_changes, ws.can_process, ws.can_complete,
      u.full_name AS requester_name, u.email AS requester_email, u.department_id AS requester_dept_id,
      d.name AS requester_dept_name
    FROM requests r
    JOIN request_types rt ON r.request_type_id = rt.id
    JOIN workflow_stages ws ON r.current_stage_id = ws.id
    JOIN users u ON r.requester_id = u.id
    JOIN departments d ON r.requester_dept_id = d.id
    WHERE r.id = ? AND r.is_archived = 0
  `).get(requestId);

  return req;
}

function getWorkflowStages(requestTypeId) {
  return db.prepare(`
    SELECT * FROM workflow_stages
    WHERE request_type_id = ?
    ORDER BY stage_order ASC
  `).all(requestTypeId);
}

/**
 * Authorization & Scope Check
 */
function verifyStageAuthorization(request, user, action) {
  // Mandatory Rule 1: NO SELF-APPROVAL
  if (request.requester_id === user.id && ['APPROVE', 'REJECT', 'COMPLETE', 'START_PROCESSING'].includes(action)) {
    return { authorized: false, reason: 'Business Rule Violation: You cannot approve or complete your own submitted request.' };
  }

  // System Administrator full access override
  if (user.role_code === 'SYSTEM_ADMIN') {
    return { authorized: true };
  }

  const currentStage = request;

  // Validate action capability against current stage flags
  if (action === 'APPROVE' && !currentStage.can_approve) {
    return { authorized: false, reason: 'Approval is not allowed at the current workflow stage.' };
  }
  if (action === 'REJECT' && !currentStage.can_reject) {
    return { authorized: false, reason: 'Rejection is not allowed at the current workflow stage.' };
  }
  if (action === 'REQUEST_CHANGES' && !currentStage.can_request_changes) {
    return { authorized: false, reason: 'Requesting changes is not allowed at the current workflow stage.' };
  }
  if (action === 'START_PROCESSING' && !currentStage.can_process) {
    return { authorized: false, reason: 'Processing action is not supported at this stage.' };
  }
  if (action === 'COMPLETE' && !currentStage.can_complete && request.status !== 'PROCESSING') {
    return { authorized: false, reason: 'Completion action is not supported at this stage.' };
  }

  // Check Role Scope & Assignment Match
  const assignedRole = currentStage.assigned_role_code;
  
  if (assignedRole === 'REPORTING_MANAGER') {
    const isDirectManager = db.prepare(`SELECT id FROM users WHERE id = ? AND manager_id = ?`).get(request.requester_id, user.id);
    const isDeptManager = db.prepare(`SELECT id FROM departments WHERE id = ? AND manager_id = ?`).get(request.requester_dept_id, user.id);
    
    if (!isDirectManager && !isDeptManager && user.role_code !== 'REPORTING_MANAGER' && user.role_code !== 'DEPARTMENT_HEAD') {
      return { authorized: false, reason: 'Only the assigned Reporting Manager or Department Lead can perform this approval.' };
    }
  } else if (assignedRole === 'DEPARTMENT_STAFF') {
    let targetDeptId = currentStage.assigned_dept_type === 'SPECIFIC_DEPT' ? currentStage.specific_dept_id : request.requester_dept_id;
    if (user.department_id !== targetDeptId && user.role_code !== 'DEPARTMENT_STAFF' && user.role_code !== 'SYSTEM_ADMIN') {
      return { authorized: false, reason: 'Action requires Department Staff assigned to the processing department queue.' };
    }
  } else if (assignedRole === 'DEPARTMENT_HEAD') {
    const isDeptDirector = db.prepare(`SELECT id FROM departments WHERE director_id = ?`).get(user.id);
    if (!isDeptDirector && user.role_code !== 'DEPARTMENT_HEAD') {
      return { authorized: false, reason: 'Action requires Department Director / Executive authority.' };
    }
  }

  return { authorized: true };
}

/**
 * Execute Workflow Action with Optimistic Concurrency Control
 */
function processWorkflowAction(requestId, actorUser, action, payload = {}) {
  const req = getRequestDetails(requestId);
  if (!req) {
    throw new Error('Request not found or archived.');
  }

  // OPTIMISTIC CONCURRENCY CHECK: If client passed a cached version that differs from current DB version
  if (payload.expectedVersion !== undefined && payload.expectedVersion !== req.version) {
    throw new Error('Concurrency Conflict: Request state was updated by another user concurrently. Please refresh and retry.');
  }

  // Terminal state check
  if (['COMPLETED', 'REJECTED', 'CANCELLED'].includes(req.status)) {
    throw new Error(`Request is in terminal state '${req.status}' and cannot be modified.`);
  }

  // Authorization Check
  const authResult = verifyStageAuthorization(req, actorUser, action);
  if (!authResult.authorized) {
    throw new Error(authResult.reason);
  }

  const stages = getWorkflowStages(req.request_type_id);
  const currentStageIndex = stages.findIndex(s => s.id === req.current_stage_id);

  let newStatus = req.status;
  let nextStage = stages[currentStageIndex];
  let rejectionReason = req.rejection_reason;
  let completedAt = req.completed_at;

  switch (action) {
    case 'APPROVE': {
      if (currentStageIndex < stages.length - 1) {
        nextStage = stages[currentStageIndex + 1];
        if (nextStage.can_process || nextStage.stage_code.includes('PROCESSING') || nextStage.stage_code.includes('FULFILLMENT') || nextStage.stage_code.includes('CHECK')) {
          newStatus = 'PROCESSING';
        } else if (nextStage.stage_code === 'COMPLETED') {
          newStatus = 'COMPLETED';
          completedAt = new Date().toISOString();
        } else {
          newStatus = 'APPROVAL_PENDING';
        }
      } else {
        newStatus = 'APPROVED';
      }

      db.prepare(`
        INSERT INTO approvals (request_id, stage_id, actor_id, decision, reason)
        VALUES (?, ?, ?, 'APPROVED', ?)
      `).run(requestId, req.current_stage_id, actorUser.id, payload.comments || 'Approved');
      break;
    }

    case 'REJECT': {
      if (!payload.reason || !payload.reason.trim()) {
        throw new Error('Mandatory Business Rule: Rejection reason is strictly required.');
      }
      newStatus = 'REJECTED';
      rejectionReason = payload.reason.trim();

      db.prepare(`
        INSERT INTO approvals (request_id, stage_id, actor_id, decision, reason)
        VALUES (?, ?, ?, 'REJECTED', ?)
      `).run(requestId, req.current_stage_id, actorUser.id, rejectionReason);
      break;
    }

    case 'REQUEST_CHANGES': {
      if (!payload.reason || !payload.reason.trim()) {
        throw new Error('Please provide details on what changes or clarifications are requested.');
      }
      newStatus = 'CHANGES_REQUESTED';
      nextStage = stages[0]; // Route back to Stage 1 (Requester)

      db.prepare(`
        INSERT INTO approvals (request_id, stage_id, actor_id, decision, reason)
        VALUES (?, ?, ?, 'CHANGES_REQUESTED', ?)
      `).run(requestId, req.current_stage_id, actorUser.id, payload.reason);
      break;
    }

    case 'START_PROCESSING': {
      newStatus = 'PROCESSING';
      break;
    }

    case 'COMPLETE': {
      if (!req.can_complete && req.status !== 'PROCESSING') {
        throw new Error('Invalid Status Transition: Cannot mark request completed before it reaches the fulfillment/processing stage.');
      }

      newStatus = 'COMPLETED';
      completedAt = new Date().toISOString();
      const finalStage = stages.find(s => s.stage_code === 'COMPLETED') || stages[stages.length - 1];
      nextStage = finalStage;
      break;
    }

    default:
      throw new Error(`Unsupported workflow action: ${action}`);
  }

  // Resolve target assignee and department for next stage
  let targetAssigneeId = req.current_assignee_id;
  let targetDeptId = req.current_dept_id;

  if (nextStage.id !== req.current_stage_id) {
    if (nextStage.assigned_role_code === 'REPORTING_MANAGER') {
      targetAssigneeId = req.manager_id || null;
      targetDeptId = req.requester_dept_id;
    } else if (nextStage.assigned_role_code === 'DEPARTMENT_STAFF') {
      targetDeptId = nextStage.specific_dept_id || req.requester_dept_id;
      targetAssigneeId = null;
    } else if (nextStage.assigned_role_code === 'EMPLOYEE') {
      targetAssigneeId = req.requester_id;
      targetDeptId = req.requester_dept_id;
    }
  }

  // OPTIMISTIC CONCURRENCY LOCK UPDATE
  const updateResult = db.prepare(`
    UPDATE requests 
    SET current_stage_id = ?,
        status = ?,
        rejection_reason = ?,
        completed_at = ?,
        current_assignee_id = ?,
        current_dept_id = ?,
        version = version + 1
    WHERE id = ? AND version = ? AND is_archived = 0
  `).run(nextStage.id, newStatus, rejectionReason, completedAt, targetAssigneeId, targetDeptId, requestId, req.version);

  if (updateResult.changes === 0) {
    throw new Error('Concurrency Conflict: Request state was updated by another user concurrently. Please refresh and retry.');
  }

  // Record Audit Log
  logAudit({
    requestId,
    actorId: actorUser.id,
    action,
    previousStatus: req.status,
    newStatus,
    previousStageId: req.current_stage_id,
    newStageId: nextStage.id,
    details: {
      action,
      notes: payload.comments || payload.reason || '',
      actorName: actorUser.full_name,
      stageName: nextStage.stage_name
    }
  });

  // Create Notification
  createNotification({
    userId: req.requester_id,
    requestId,
    type: action,
    title: `Request ${req.request_number} Updated`,
    message: `Your ${req.request_type_name} status changed to ${newStatus}. Action by ${actorUser.full_name}.`
  });

  // Append Comment if provided
  if (payload.comments || payload.reason) {
    db.prepare(`
      INSERT INTO comments (request_id, user_id, content)
      VALUES (?, ?, ?)
    `).run(requestId, actorUser.id, payload.comments || payload.reason);
  }

  return getRequestDetails(requestId);
}

/**
 * Soft Delete Request
 */
function softDeleteRequest(requestId, actorUser) {
  if (actorUser.role_code !== 'SYSTEM_ADMIN') {
    throw new Error('Access denied: System Administrator privileges required for archiving/deleting requests.');
  }

  const result = db.prepare(`
    UPDATE requests SET is_archived = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND is_archived = 0
  `).run(requestId);

  if (result.changes > 0) {
    logAudit({
      requestId,
      actorId: actorUser.id,
      action: 'SOFT_DELETED',
      details: { message: 'Request soft deleted / archived by administrator.' }
    });
  }

  return { success: result.changes > 0 };
}

module.exports = {
  getRequestDetails,
  getWorkflowStages,
  verifyStageAuthorization,
  processWorkflowAction,
  softDeleteRequest
};
