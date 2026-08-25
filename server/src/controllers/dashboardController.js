const { db } = require('../db/schema');
const { calculateSlaState } = require('../services/slaService');

function getDashboardMetrics(req, res) {
  const user = req.user;

  // Fetch all relevant requests for SLA evaluation
  const allRawRequests = db.prepare(`
    SELECT r.*, rt.code AS request_type_code, rt.name AS request_type_name, rt.target_sla_hours, d.name AS dept_name
    FROM requests r
    JOIN request_types rt ON r.request_type_id = rt.id
    JOIN departments d ON r.requester_dept_id = d.id
  `).all();

  // Compute live SLA for all requests
  const requestsWithSla = allRawRequests.map(r => ({
    ...r,
    sla: calculateSlaState(r.submitted_at, r.target_sla_at, r.completed_at, r.target_sla_hours)
  }));

  let metrics = {};

  if (user.role_code === 'EMPLOYEE') {
    const myReqs = requestsWithSla.filter(r => r.requester_id === user.id);
    const active = myReqs.filter(r => !['COMPLETED', 'REJECTED', 'CANCELLED'].includes(r.status));
    const actionRequired = myReqs.filter(r => r.status === 'CHANGES_REQUESTED');
    const completed = myReqs.filter(r => r.status === 'COMPLETED');
    const overdue = myReqs.filter(r => r.sla.isOverdue && !['COMPLETED', 'REJECTED'].includes(r.status));

    metrics = {
      role: 'EMPLOYEE',
      activeCount: active.length,
      actionRequiredCount: actionRequired.length,
      completedCount: completed.length,
      overdueCount: overdue.length,
      recentRequests: myReqs.slice(0, 5)
    };
  } else if (user.role_code === 'REPORTING_MANAGER') {
    const teamReqs = requestsWithSla.filter(r => r.requester_dept_id === user.department_id);
    const pendingApproval = teamReqs.filter(r => r.current_assignee_id === user.id || (r.status === 'APPROVAL_PENDING' && r.requester_dept_id === user.department_id));
    const overdue = teamReqs.filter(r => r.sla.isOverdue && !['COMPLETED', 'REJECTED'].includes(r.status));
    const recentlyApproved = teamReqs.filter(r => ['PROCESSING', 'COMPLETED'].includes(r.status)).slice(0, 5);

    metrics = {
      role: 'REPORTING_MANAGER',
      pendingApprovalsCount: pendingApproval.length,
      teamTotalCount: teamReqs.length,
      overdueCount: overdue.length,
      pendingApprovals: pendingApproval,
      recentApproved: recentlyApproved
    };
  } else if (user.role_code === 'DEPARTMENT_STAFF') {
    const deptQueue = requestsWithSla.filter(r => r.current_dept_id === user.department_id);
    const inProgress = deptQueue.filter(r => r.status === 'PROCESSING');
    const overdue = deptQueue.filter(r => r.sla.isOverdue && !['COMPLETED', 'REJECTED'].includes(r.status));
    
    // Workload breakdown by request type
    const workloadByType = {};
    deptQueue.forEach(r => {
      workloadByType[r.request_type_name] = (workloadByType[r.request_type_name] || 0) + 1;
    });

    metrics = {
      role: 'DEPARTMENT_STAFF',
      queueCount: deptQueue.length,
      inProgressCount: inProgress.length,
      overdueCount: overdue.length,
      workloadByType,
      deptQueue: deptQueue.slice(0, 10)
    };
  } else {
    // OPERATIONS_MANAGER, SYSTEM_ADMIN, DEPARTMENT_HEAD
    const total = requestsWithSla.length;
    const open = requestsWithSla.filter(r => !['COMPLETED', 'REJECTED', 'CANCELLED'].includes(r.status)).length;
    const pendingApproval = requestsWithSla.filter(r => r.status === 'APPROVAL_PENDING').length;
    const inProgress = requestsWithSla.filter(r => r.status === 'PROCESSING').length;
    const completed = requestsWithSla.filter(r => r.status === 'COMPLETED').length;
    const overdue = requestsWithSla.filter(r => r.sla.isOverdue && !['COMPLETED', 'REJECTED'].includes(r.status)).length;

    // SLA performance compliance percentage
    const completedReqs = requestsWithSla.filter(r => r.completed_at);
    const slaMet = completedReqs.filter(r => r.sla.code === 'COMPLETED_WITHIN_SLA').length;
    const slaPerformance = completedReqs.length > 0 ? Math.round((slaMet / completedReqs.length) * 100) : 100;

    // Department breakdown
    const byDept = {};
    requestsWithSla.forEach(r => {
      byDept[r.dept_name] = (byDept[r.dept_name] || 0) + 1;
    });

    // Category breakdown
    const byCategory = {};
    requestsWithSla.forEach(r => {
      byCategory[r.request_type_name] = (byCategory[r.request_type_name] || 0) + 1;
    });

    metrics = {
      role: user.role_code,
      totalRequests: total,
      openRequests: open,
      pendingApprovals: pendingApproval,
      inProgressRequests: inProgress,
      completedRequests: completed,
      overdueRequests: overdue,
      slaPerformancePercent: slaPerformance,
      byDepartment: byDept,
      byCategory: byCategory,
      recentActivity: requestsWithSla.slice(0, 10)
    };
  }

  return res.json({ metrics });
}

module.exports = { getDashboardMetrics };
