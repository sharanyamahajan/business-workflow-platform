const bcrypt = require('bcryptjs');
const { db, initSchema } = require('./schema');

function seedDatabase() {
  initSchema();

  // Disable foreign keys temporarily during seed cleanup and reset autoincrement sequences
  db.exec(`
    PRAGMA foreign_keys = OFF;
    DELETE FROM audit_logs;
    DELETE FROM comments;
    DELETE FROM approvals;
    DELETE FROM assignments;
    DELETE FROM attachments;
    DELETE FROM notifications;
    DELETE FROM requests;
    DELETE FROM workflow_stages;
    DELETE FROM request_types;
    DELETE FROM users;
    DELETE FROM departments;
    DELETE FROM roles;
    DELETE FROM sqlite_sequence;
    PRAGMA foreign_keys = ON;
  `);

  // 1. Roles
  const roles = [
    { code: 'EMPLOYEE', name: 'Employee', description: 'Regular staff member requesting services' },
    { code: 'REPORTING_MANAGER', name: 'Reporting Manager', description: 'People manager responsible for team approvals' },
    { code: 'DEPARTMENT_STAFF', name: 'Department Staff', description: 'Fulfillment specialist processing queue requests' },
    { code: 'DEPARTMENT_HEAD', name: 'Department Head / Director', description: 'Executive leader for high-tier approvals' },
    { code: 'OPERATIONS_MANAGER', name: 'Operations Manager', description: 'Org-wide SLA, bottleneck, and analytics auditor' },
    { code: 'SYSTEM_ADMIN', name: 'System Administrator', description: 'Platform configuration, workflow, and user admin' }
  ];

  const insertRole = db.prepare(`
    INSERT INTO roles (code, name, description) VALUES (@code, @name, @description)
  `);
  
  for (const r of roles) {
    insertRole.run(r);
  }

  const roleMap = {};
  db.prepare('SELECT id, code FROM roles').all().forEach(r => roleMap[r.code] = r.id);

  // 2. Departments
  const departments = [
    { code: 'ENG', name: 'Product Engineering' },
    { code: 'FIN', name: 'Finance & Accounting' },
    { code: 'IT', name: 'IT & Infrastructure' },
    { code: 'HR', name: 'Human Resources' },
    { code: 'OPS', name: 'Operations' },
    { code: 'EXEC', name: 'Executive Leadership' }
  ];

  const insertDept = db.prepare(`
    INSERT INTO departments (code, name) VALUES (@code, @name)
  `);

  for (const d of departments) {
    insertDept.run(d);
  }

  const deptMap = {};
  db.prepare('SELECT id, code FROM departments').all().forEach(d => deptMap[d.code] = d.id);

  // 3. Users
  const passwordHash = bcrypt.hashSync('Password123!', 10);

  const users = [
    {
      email: 'aarav.sharma@company.com',
      full_name: 'Aarav Sharma',
      role_id: roleMap['EMPLOYEE'],
      department_id: deptMap['ENG'],
      manager_id: null
    },
    {
      email: 'priya.mehta@company.com',
      full_name: 'Priya Mehta',
      role_id: roleMap['EMPLOYEE'],
      department_id: deptMap['ENG'],
      manager_id: null
    },
    {
      email: 'rajesh.kumar@company.com',
      full_name: 'Rajesh Kumar',
      role_id: roleMap['REPORTING_MANAGER'],
      department_id: deptMap['ENG'],
      manager_id: null
    },
    {
      email: 'vikram.singh@company.com',
      full_name: 'Vikram Singh',
      role_id: roleMap['DEPARTMENT_STAFF'],
      department_id: deptMap['IT'],
      manager_id: null
    },
    {
      email: 'neha.verma@company.com',
      full_name: 'Neha Verma',
      role_id: roleMap['DEPARTMENT_STAFF'],
      department_id: deptMap['FIN'],
      manager_id: null
    },
    {
      email: 'ananya.roy@company.com',
      full_name: 'Ananya Roy',
      role_id: roleMap['DEPARTMENT_HEAD'],
      department_id: deptMap['ENG'],
      manager_id: null
    },
    {
      email: 'siddharth.patel@company.com',
      full_name: 'Siddharth Patel',
      role_id: roleMap['OPERATIONS_MANAGER'],
      department_id: deptMap['OPS'],
      manager_id: null
    },
    {
      email: 'admin@company.com',
      full_name: 'System Admin',
      role_id: roleMap['SYSTEM_ADMIN'],
      department_id: deptMap['IT'],
      manager_id: null
    }
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, full_name, role_id, department_id, manager_id)
    VALUES (@email, '${passwordHash}', @full_name, @role_id, @department_id, @manager_id)
  `);

  for (const u of users) {
    insertUser.run(u);
  }

  const userMap = {};
  db.prepare('SELECT id, email FROM users').all().forEach(u => userMap[u.email] = u.id);

  // Link Manager relationships & Dept Leadership
  db.prepare(`UPDATE users SET manager_id = ? WHERE email IN (?, ?)`).run(
    userMap['rajesh.kumar@company.com'],
    'aarav.sharma@company.com',
    'priya.mehta@company.com'
  );

  db.prepare(`UPDATE departments SET manager_id = ?, director_id = ? WHERE code = 'ENG'`).run(
    userMap['rajesh.kumar@company.com'],
    userMap['ananya.roy@company.com']
  );

  // 4. Request Types
  const requestTypes = [
    {
      code: 'SOFTWARE_ACCESS',
      name: 'Software Access Request',
      description: 'Request access or account provisioning for company software tools and applications.',
      target_sla_hours: 24,
      form_schema: JSON.stringify({
        fields: [
          { name: 'softwareName', label: 'Application / Software Name', type: 'text', required: true },
          { name: 'accessLevel', label: 'Requested Access Level', type: 'select', options: ['Standard User', 'Administrator', 'Developer / Read-Write', 'ReadOnly'], required: true },
          { name: 'businessJustification', label: 'Business Justification', type: 'textarea', required: true },
          { name: 'requiredDate', label: 'Required By Date', type: 'date', required: true }
        ]
      })
    },
    {
      code: 'EXPENSE_REIMBURSEMENT',
      name: 'Expense Reimbursement',
      description: 'Submit business expense claims with receipts for financial reimbursement.',
      target_sla_hours: 48,
      form_schema: JSON.stringify({
        fields: [
          { name: 'expenseCategory', label: 'Expense Category', type: 'select', options: ['Travel', 'Client Meeting', 'Software License', 'Office Supplies', 'Training / Workshop'], required: true },
          { name: 'expenseDate', label: 'Expense Date', type: 'date', required: true },
          { name: 'amount', label: 'Amount (INR)', type: 'number', required: true },
          { name: 'businessPurpose', label: 'Business Purpose', type: 'textarea', required: true },
          { name: 'description', label: 'Line Item Breakdown', type: 'textarea', required: false }
        ]
      })
    },
    {
      code: 'DOCUMENT_APPROVAL',
      name: 'Document Approval',
      description: 'Submit organizational documents, proposals, or policies for formal review and sign-off.',
      target_sla_hours: 72,
      form_schema: JSON.stringify({
        fields: [
          { name: 'documentTitle', label: 'Document Title', type: 'text', required: true },
          { name: 'documentType', label: 'Document Type', type: 'select', options: ['Internal Policy', 'Process Document', 'Client-Facing Document', 'Technical Specification', 'Department Proposal'], required: true },
          { name: 'documentVersion', label: 'Document Version', type: 'text', required: true, default: '1.0' },
          { name: 'approvalDeadline', label: 'Approval Deadline', type: 'date', required: true },
          { name: 'description', label: 'Executive Summary', type: 'textarea', required: true }
        ]
      })
    },
    {
      code: 'EQUIPMENT_REQUEST',
      name: 'Equipment Request',
      description: 'Request hardware assets, monitors, laptops, or peripheral accessories.',
      target_sla_hours: 72,
      form_schema: JSON.stringify({
        fields: [
          { name: 'equipmentType', label: 'Equipment Type', type: 'select', options: ['Laptop (MacBook Pro / ThinkPad)', 'External Monitor', 'Keyboard / Mouse Combo', 'Headset', 'Docking Station'], required: true },
          { name: 'quantity', label: 'Quantity', type: 'number', required: true, default: 1 },
          { name: 'businessJustification', label: 'Business Justification', type: 'textarea', required: true },
          { name: 'requiredDate', label: 'Required By Date', type: 'date', required: true },
          { name: 'additionalInfo', label: 'Technical Specifications / Notes', type: 'textarea', required: false }
        ]
      })
    }
  ];

  const insertType = db.prepare(`
    INSERT INTO request_types (code, name, description, target_sla_hours, form_schema)
    VALUES (@code, @name, @description, @target_sla_hours, @form_schema)
  `);

  for (const t of requestTypes) {
    insertType.run(t);
  }

  const typeMap = {};
  db.prepare('SELECT id, code FROM request_types').all().forEach(t => typeMap[t.code] = t.id);

  // 5. Workflow Stages
  const stages = [
    // 1. Software Access Workflow
    { request_type_id: typeMap['SOFTWARE_ACCESS'], stage_order: 1, stage_code: 'SUBMITTED', stage_name: 'Request Submitted', assigned_role_code: 'EMPLOYEE', assigned_dept_type: 'REQUESTER_DEPT', specific_dept_id: null, can_approve: 0, can_reject: 0, can_request_changes: 0, can_process: 0, can_complete: 0 },
    { request_type_id: typeMap['SOFTWARE_ACCESS'], stage_order: 2, stage_code: 'MANAGER_APPROVAL', stage_name: 'Reporting Manager Review', assigned_role_code: 'REPORTING_MANAGER', assigned_dept_type: 'REQUESTER_DEPT', specific_dept_id: null, can_approve: 1, can_reject: 1, can_request_changes: 1, can_process: 0, can_complete: 0 },
    { request_type_id: typeMap['SOFTWARE_ACCESS'], stage_order: 3, stage_code: 'IT_FULFILLMENT', stage_name: 'IT Account Provisioning', assigned_role_code: 'DEPARTMENT_STAFF', assigned_dept_type: 'SPECIFIC_DEPT', specific_dept_id: deptMap['IT'], can_approve: 0, can_reject: 1, can_request_changes: 1, can_process: 1, can_complete: 1 },
    { request_type_id: typeMap['SOFTWARE_ACCESS'], stage_order: 4, stage_code: 'COMPLETED', stage_name: 'Fulfillment Completed', assigned_role_code: 'SYSTEM_ADMIN', assigned_dept_type: 'SPECIFIC_DEPT', specific_dept_id: deptMap['IT'], can_approve: 0, can_reject: 0, can_request_changes: 0, can_process: 0, can_complete: 1 },

    // 2. Expense Reimbursement Workflow
    { request_type_id: typeMap['EXPENSE_REIMBURSEMENT'], stage_order: 1, stage_code: 'SUBMITTED', stage_name: 'Claim Submitted', assigned_role_code: 'EMPLOYEE', assigned_dept_type: 'REQUESTER_DEPT', specific_dept_id: null, can_approve: 0, can_reject: 0, can_request_changes: 0, can_process: 0, can_complete: 0 },
    { request_type_id: typeMap['EXPENSE_REIMBURSEMENT'], stage_order: 2, stage_code: 'MANAGER_APPROVAL', stage_name: 'Reporting Manager Approval', assigned_role_code: 'REPORTING_MANAGER', assigned_dept_type: 'REQUESTER_DEPT', specific_dept_id: null, can_approve: 1, can_reject: 1, can_request_changes: 1, can_process: 0, can_complete: 0 },
    { request_type_id: typeMap['EXPENSE_REIMBURSEMENT'], stage_order: 3, stage_code: 'FINANCE_VERIFICATION', stage_name: 'Finance Audit & Receipt Verification', assigned_role_code: 'DEPARTMENT_STAFF', assigned_dept_type: 'SPECIFIC_DEPT', specific_dept_id: deptMap['FIN'], can_approve: 1, can_reject: 1, can_request_changes: 1, can_process: 1, can_complete: 0 },
    { request_type_id: typeMap['EXPENSE_REIMBURSEMENT'], stage_order: 4, stage_code: 'REIMBURSEMENT_PROCESSING', stage_name: 'Disbursement & Payment Processing', assigned_role_code: 'DEPARTMENT_STAFF', assigned_dept_type: 'SPECIFIC_DEPT', specific_dept_id: deptMap['FIN'], can_approve: 0, can_reject: 0, can_request_changes: 0, can_process: 1, can_complete: 1 },
    { request_type_id: typeMap['EXPENSE_REIMBURSEMENT'], stage_order: 5, stage_code: 'COMPLETED', stage_name: 'Payment Completed', assigned_role_code: 'SYSTEM_ADMIN', assigned_dept_type: 'SPECIFIC_DEPT', specific_dept_id: deptMap['FIN'], can_approve: 0, can_reject: 0, can_request_changes: 0, can_process: 0, can_complete: 1 },

    // 3. Document Approval Workflow
    { request_type_id: typeMap['DOCUMENT_APPROVAL'], stage_order: 1, stage_code: 'SUBMITTED', stage_name: 'Document Submitted', assigned_role_code: 'EMPLOYEE', assigned_dept_type: 'REQUESTER_DEPT', specific_dept_id: null, can_approve: 0, can_reject: 0, can_request_changes: 0, can_process: 0, can_complete: 0 },
    { request_type_id: typeMap['DOCUMENT_APPROVAL'], stage_order: 2, stage_code: 'DEPT_MANAGER_APPROVAL', stage_name: 'Department Manager Review', assigned_role_code: 'REPORTING_MANAGER', assigned_dept_type: 'REQUESTER_DEPT', specific_dept_id: null, can_approve: 1, can_reject: 1, can_request_changes: 1, can_process: 0, can_complete: 0 },
    { request_type_id: typeMap['DOCUMENT_APPROVAL'], stage_order: 3, stage_code: 'DIRECTOR_APPROVAL', stage_name: 'Director Approval', assigned_role_code: 'DEPARTMENT_HEAD', assigned_dept_type: 'REQUESTER_DEPT', specific_dept_id: null, can_approve: 1, can_reject: 1, can_request_changes: 1, can_process: 0, can_complete: 0 },
    { request_type_id: typeMap['DOCUMENT_APPROVAL'], stage_order: 4, stage_code: 'FINAL_APPROVAL', stage_name: 'Executive Sign-off', assigned_role_code: 'DEPARTMENT_HEAD', assigned_dept_type: 'SPECIFIC_DEPT', specific_dept_id: deptMap['EXEC'], can_approve: 1, can_reject: 1, can_request_changes: 1, can_process: 0, can_complete: 1 },
    { request_type_id: typeMap['DOCUMENT_APPROVAL'], stage_order: 5, stage_code: 'COMPLETED', stage_name: 'Approval Published', assigned_role_code: 'SYSTEM_ADMIN', assigned_dept_type: 'REQUESTER_DEPT', specific_dept_id: null, can_approve: 0, can_reject: 0, can_request_changes: 0, can_process: 0, can_complete: 1 },

    // 4. Equipment Request Workflow
    { request_type_id: typeMap['EQUIPMENT_REQUEST'], stage_order: 1, stage_code: 'SUBMITTED', stage_name: 'Request Submitted', assigned_role_code: 'EMPLOYEE', assigned_dept_type: 'REQUESTER_DEPT', specific_dept_id: null, can_approve: 0, can_reject: 0, can_request_changes: 0, can_process: 0, can_complete: 0 },
    { request_type_id: typeMap['EQUIPMENT_REQUEST'], stage_order: 2, stage_code: 'MANAGER_APPROVAL', stage_name: 'Reporting Manager Review', assigned_role_code: 'REPORTING_MANAGER', assigned_dept_type: 'REQUESTER_DEPT', specific_dept_id: null, can_approve: 1, can_reject: 1, can_request_changes: 1, can_process: 0, can_complete: 0 },
    { request_type_id: typeMap['EQUIPMENT_REQUEST'], stage_order: 3, stage_code: 'IT_ADMIN_CHECK', stage_name: 'IT / Asset Availability Check', assigned_role_code: 'DEPARTMENT_STAFF', assigned_dept_type: 'SPECIFIC_DEPT', specific_dept_id: deptMap['IT'], can_approve: 1, can_reject: 1, can_request_changes: 1, can_process: 1, can_complete: 0 },
    { request_type_id: typeMap['EQUIPMENT_REQUEST'], stage_order: 4, stage_code: 'PROCUREMENT_INVENTORY', stage_name: 'Procurement / Asset Allocation', assigned_role_code: 'DEPARTMENT_STAFF', assigned_dept_type: 'SPECIFIC_DEPT', specific_dept_id: deptMap['FIN'], can_approve: 0, can_reject: 1, can_request_changes: 1, can_process: 1, can_complete: 1 },
    { request_type_id: typeMap['EQUIPMENT_REQUEST'], stage_order: 5, stage_code: 'COMPLETED', stage_name: 'Asset Allocated & Issued', assigned_role_code: 'SYSTEM_ADMIN', assigned_dept_type: 'SPECIFIC_DEPT', specific_dept_id: deptMap['IT'], can_approve: 0, can_reject: 0, can_request_changes: 0, can_process: 0, can_complete: 1 }
  ];

  const insertStage = db.prepare(`
    INSERT INTO workflow_stages 
    (request_type_id, stage_order, stage_code, stage_name, assigned_role_code, assigned_dept_type, specific_dept_id, can_approve, can_reject, can_request_changes, can_process, can_complete)
    VALUES (@request_type_id, @stage_order, @stage_code, @stage_name, @assigned_role_code, @assigned_dept_type, @specific_dept_id, @can_approve, @can_reject, @can_request_changes, @can_process, @can_complete)
  `);

  for (const s of stages) {
    insertStage.run(s);
  }

  // Seed initial sample active requests
  const now = new Date();
  const slaTarget1 = new Date(now.getTime() + 18 * 3600 * 1000).toISOString();
  const stageSoftMgr = db.prepare(`SELECT id FROM workflow_stages WHERE request_type_id = ? AND stage_code = 'MANAGER_APPROVAL'`).get(typeMap['SOFTWARE_ACCESS']);

  const req1 = db.prepare(`
    INSERT INTO requests 
    (request_number, request_type_id, requester_id, requester_dept_id, current_stage_id, status, priority, current_assignee_id, current_dept_id, title, form_data, required_date, target_sla_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'REQ-2026-00101',
    typeMap['SOFTWARE_ACCESS'],
    userMap['aarav.sharma@company.com'],
    deptMap['ENG'],
    stageSoftMgr.id,
    'APPROVAL_PENDING',
    'HIGH',
    userMap['rajesh.kumar@company.com'],
    deptMap['ENG'],
    'Jira & Confluence Enterprise Access',
    JSON.stringify({
      softwareName: 'Jira & Confluence Enterprise',
      accessLevel: 'Developer / Read-Write',
      businessJustification: 'Required for sprint coordination and technical design documentation for Project VESA.',
      requiredDate: '2026-08-30'
    }),
    '2026-08-30',
    slaTarget1
  );

  const slaTarget2 = new Date(now.getTime() - 2 * 3600 * 1000).toISOString();
  const stageExpFin = db.prepare(`SELECT id FROM workflow_stages WHERE request_type_id = ? AND stage_code = 'FINANCE_VERIFICATION'`).get(typeMap['EXPENSE_REIMBURSEMENT']);

  const req2 = db.prepare(`
    INSERT INTO requests 
    (request_number, request_type_id, requester_id, requester_dept_id, current_stage_id, status, priority, current_assignee_id, current_dept_id, title, form_data, required_date, target_sla_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'REQ-2026-00102',
    typeMap['EXPENSE_REIMBURSEMENT'],
    userMap['priya.mehta@company.com'],
    deptMap['ENG'],
    stageExpFin.id,
    'PROCESSING',
    'URGENT',
    userMap['neha.verma@company.com'],
    deptMap['FIN'],
    'Client Meeting Lunch & Travel Reimbursement',
    JSON.stringify({
      expenseCategory: 'Client Meeting',
      expenseDate: '2026-08-20',
      amount: 4850,
      businessPurpose: 'Onboarding lunch meeting with enterprise prospective client representatives.',
      description: 'Taxi fare (₹1,200) + Client Dining Receipt (₹3,650)'
    }),
    '2026-08-28',
    slaTarget2
  );

  db.prepare(`
    INSERT INTO audit_logs (request_id, actor_id, action, previous_status, new_status, new_stage_id, details_json)
    VALUES (?, ?, 'SUBMITTED', NULL, 'APPROVAL_PENDING', ?, ?)
  `).run(req1.lastInsertRowid, userMap['aarav.sharma@company.com'], stageSoftMgr.id, JSON.stringify({ message: 'Request created and routed to Reporting Manager for approval' }));

  db.prepare(`
    INSERT INTO comments (request_id, user_id, content)
    VALUES (?, ?, ?)
  `).run(req1.lastInsertRowid, userMap['aarav.sharma@company.com'], 'Hi Rajesh, please approve access so I can join the sprint board.');

  console.log('Database seeded successfully!');
}

module.exports = { seedDatabase };

if (require.main === module) {
  seedDatabase();
}
