const request = require('supertest');
const app = require('../src/index');
const { calculateSlaState } = require('../src/services/slaService');
const { db } = require('../src/db/schema');

describe('Business Workflow Platform API & Complete Engineering Refinement Tests', () => {
  let employeeToken = '';
  let managerToken = '';
  let unauthorizedToken = '';
  let adminToken = '';
  
  let employeeUser = null;
  let managerUser = null;
  let unauthorizedUser = null;
  let testRequestId = null;
  let testAttachmentId = null;

  beforeAll(async () => {
    // 1. Employee (Aarav Sharma - Eng)
    const empRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'aarav.sharma@company.com', password: 'Password123!' });
    employeeToken = empRes.body.token;
    employeeUser = empRes.body.user;

    // 2. Manager (Rajesh Kumar - Eng Manager)
    const mgrRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'rajesh.kumar@company.com', password: 'Password123!' });
    managerToken = mgrRes.body.token;
    managerUser = mgrRes.body.user;

    // 3. Unauthorized Employee in Finance Department (Neha Verma)
    const unauthRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'neha.verma@company.com', password: 'Password123!' });
    unauthorizedToken = unauthRes.body.token;
    unauthorizedUser = unauthRes.body.user;

    // 4. System Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@company.com', password: 'Password123!' });
    adminToken = adminRes.body.token;
  });

  test('1. Authentication: Successfully logs in and returns valid JWT token', () => {
    expect(employeeToken).toBeTruthy();
    expect(employeeUser.role_code).toBe('EMPLOYEE');
    expect(managerUser.role_code).toBe('REPORTING_MANAGER');
  });

  test('2. Request Creation: Employee creates Equipment Request', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        request_type_id: 4, // Equipment Request
        title: 'MacBook Pro M3 Max Upgrade',
        priority: 'HIGH',
        required_date: '2026-09-05',
        form_data: {
          equipmentType: 'Laptop (MacBook Pro / ThinkPad)',
          quantity: 1,
          businessJustification: 'Required for local AI model compilation and heavy docker builds.',
          requiredDate: '2026-09-05'
        }
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.request.request_number).toMatch(/REQ-2026-\d+/);
    expect(res.body.request.status).toBe('APPROVAL_PENDING');
    testRequestId = res.body.request.id;

    // Create an attachment entry for testing attachment access control
    const attStmt = db.prepare(`
      INSERT INTO attachments (request_id, uploaded_by_id, original_name, stored_name, file_path, file_size, mime_type)
      VALUES (?, ?, 'spec_sheet.pdf', 'doc-12345.pdf', '/tmp/doc-12345.pdf', 2048, 'application/pdf')
    `).run(testRequestId, employeeUser.id);
    testAttachmentId = attStmt.lastInsertRowid;
  });

  test('3. Business Rule Enforcement: Prevent Self-Approval by Requester', async () => {
    const res = await request(app)
      .post(`/api/requests/${testRequestId}/actions`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ action: 'APPROVE', comments: 'Self approval attempt' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('cannot approve or complete your own submitted request');
  });

  test('4. Business Rule Enforcement: Rejection strictly requires a reason', async () => {
    const res = await request(app)
      .post(`/api/requests/${testRequestId}/actions`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ action: 'REJECT', reason: '' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('Rejection reason is strictly required');
  });

  test('5. Invalid Transition Rejection: Direct completion from early stage blocked', async () => {
    const res = await request(app)
      .post(`/api/requests/${testRequestId}/actions`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ action: 'COMPLETE' });

    expect(res.statusCode).toBe(400);
  });

  test('6. Unauthorized Cross-User Access Attempt (403 Forbidden)', async () => {
    const res = await request(app)
      .get(`/api/requests/${testRequestId}`)
      .set('Authorization', `Bearer ${unauthorizedToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toContain('Access denied');
  });

  test('7. Unauthorized Attachment Download Access Control (403 Forbidden)', async () => {
    const res = await request(app)
      .get(`/api/requests/attachments/${testAttachmentId}/download`)
      .set('Authorization', `Bearer ${unauthorizedToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toContain('Access denied: You are not authorized to download this attachment');
  });

  test('8. Comments Thread: Post clarification comment', async () => {
    const res = await request(app)
      .post(`/api/requests/${testRequestId}/comments`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ content: 'Hi Rajesh, please confirm if budget allocation is approved.' });

    expect(res.statusCode).toBe(201);
    expect(res.body.comment.content).toContain('confirm if budget allocation is approved');
  });

  test('9. Optimistic Concurrency Control (409 Conflict)', async () => {
    db.prepare(`UPDATE requests SET version = 999 WHERE id = ?`).run(testRequestId);

    const res = await request(app)
      .post(`/api/requests/${testRequestId}/actions`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ action: 'APPROVE', comments: 'Manager approval', version: 1 });

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toContain('Concurrency Conflict');

    db.prepare(`UPDATE requests SET version = 1 WHERE id = ?`).run(testRequestId);
  });

  test('10. Successful Approval Flow: Manager approves request', async () => {
    const res = await request(app)
      .post(`/api/requests/${testRequestId}/actions`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ action: 'APPROVE', comments: 'Manager approval granted.' });

    expect(res.statusCode).toBe(200);
    expect(res.body.request.status).toBe('PROCESSING');
  });

  test('11. Server-Side SQL Filtering Verification', async () => {
    const res = await request(app)
      .get('/api/requests?request_type_id=4&status=PROCESSING')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.requests)).toBe(true);
    expect(res.body.requests.length).toBeGreaterThan(0);
    expect(res.body.requests[0].status).toBe('PROCESSING');
  });

  test('12. SLA Calculation Engine: Computes SLA state from timestamps', () => {
    const now = new Date();
    const futureSla = new Date(now.getTime() + 20 * 3600 * 1000).toISOString();
    const pastSla = new Date(now.getTime() - 5 * 3600 * 1000).toISOString();

    const withinSlaState = calculateSlaState(now.toISOString(), futureSla, null, 24);
    expect(withinSlaState.isOverdue).toBe(false);

    const overdueSlaState = calculateSlaState(now.toISOString(), pastSla, null, 24);
    expect(overdueSlaState.code).toBe('OVERDUE');
    expect(overdueSlaState.isOverdue).toBe(true);
  });

  test('13. Soft Delete & Historical Integrity: Archiving preserves audit records', async () => {
    const delRes = await request(app)
      .delete(`/api/requests/${testRequestId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(delRes.statusCode).toBe(200);
    expect(delRes.body.success).toBe(true);

    const dbRow = db.prepare(`SELECT is_archived, deleted_at FROM requests WHERE id = ?`).get(testRequestId);
    expect(dbRow.is_archived).toBe(1);
    expect(dbRow.deleted_at).toBeTruthy();

    const audits = db.prepare(`SELECT * FROM audit_logs WHERE request_id = ?`).all(testRequestId);
    expect(audits.length).toBeGreaterThan(0);
  });
});
