const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// Ensure upload directory exists
if (!fs.existsSync(config.UPLOAD_DIR)) {
  fs.mkdirSync(config.UPLOAD_DIR, { recursive: true });
}

const db = new Database(config.DB_FILE);

// Enable Foreign Key support
db.pragma('foreign_keys = ON');

function initSchema() {
  db.exec(`
    -- Roles
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT
    );

    -- Departments
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      manager_id INTEGER,
      director_id INTEGER,
      FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (director_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Users
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role_id INTEGER NOT NULL,
      department_id INTEGER NOT NULL,
      manager_id INTEGER,
      status TEXT DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (role_id) REFERENCES roles(id),
      FOREIGN KEY (department_id) REFERENCES departments(id),
      FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Request Types
    CREATE TABLE IF NOT EXISTS request_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      target_sla_hours INTEGER NOT NULL DEFAULT 24,
      form_schema TEXT NOT NULL
    );

    -- Workflow Stages
    CREATE TABLE IF NOT EXISTS workflow_stages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_type_id INTEGER NOT NULL,
      stage_order INTEGER NOT NULL,
      stage_code TEXT NOT NULL,
      stage_name TEXT NOT NULL,
      assigned_role_code TEXT NOT NULL,
      assigned_dept_type TEXT NOT NULL DEFAULT 'REQUESTER_DEPT',
      specific_dept_id INTEGER,
      can_approve INTEGER DEFAULT 1,
      can_reject INTEGER DEFAULT 1,
      can_request_changes INTEGER DEFAULT 1,
      can_process INTEGER DEFAULT 0,
      can_complete INTEGER DEFAULT 0,
      FOREIGN KEY (request_type_id) REFERENCES request_types(id) ON DELETE CASCADE,
      FOREIGN KEY (specific_dept_id) REFERENCES departments(id) ON DELETE SET NULL
    );

    -- Requests
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_number TEXT UNIQUE NOT NULL,
      request_type_id INTEGER NOT NULL,
      requester_id INTEGER NOT NULL,
      requester_dept_id INTEGER NOT NULL,
      current_stage_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'SUBMITTED',
      priority TEXT NOT NULL DEFAULT 'MEDIUM',
      current_assignee_id INTEGER,
      current_dept_id INTEGER,
      title TEXT NOT NULL,
      form_data TEXT NOT NULL,
      rejection_reason TEXT,
      version INTEGER NOT NULL DEFAULT 1,
      is_archived INTEGER NOT NULL DEFAULT 0,
      deleted_at DATETIME,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      required_date DATETIME,
      completed_at DATETIME,
      target_sla_at DATETIME NOT NULL,
      FOREIGN KEY (request_type_id) REFERENCES request_types(id),
      FOREIGN KEY (requester_id) REFERENCES users(id),
      FOREIGN KEY (requester_dept_id) REFERENCES departments(id),
      FOREIGN KEY (current_stage_id) REFERENCES workflow_stages(id),
      FOREIGN KEY (current_assignee_id) REFERENCES users(id),
      FOREIGN KEY (current_dept_id) REFERENCES departments(id)
    );

    -- Approvals History
    CREATE TABLE IF NOT EXISTS approvals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL,
      stage_id INTEGER NOT NULL,
      actor_id INTEGER NOT NULL,
      decision TEXT NOT NULL,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
      FOREIGN KEY (stage_id) REFERENCES workflow_stages(id),
      FOREIGN KEY (actor_id) REFERENCES users(id)
    );

    -- Assignments History
    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL,
      stage_id INTEGER NOT NULL,
      assigned_by_id INTEGER,
      assigned_to_id INTEGER,
      assigned_dept_id INTEGER,
      assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      unassigned_at DATETIME,
      FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
      FOREIGN KEY (stage_id) REFERENCES workflow_stages(id),
      FOREIGN KEY (assigned_by_id) REFERENCES users(id),
      FOREIGN KEY (assigned_to_id) REFERENCES users(id),
      FOREIGN KEY (assigned_dept_id) REFERENCES departments(id)
    );

    -- Comments
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      is_internal INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Attachments
    CREATE TABLE IF NOT EXISTS attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL,
      uploaded_by_id INTEGER NOT NULL,
      original_name TEXT NOT NULL,
      stored_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
      FOREIGN KEY (uploaded_by_id) REFERENCES users(id)
    );

    -- Notifications
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      request_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
    );

    -- Audit Trail
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL,
      actor_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      previous_status TEXT,
      new_status TEXT,
      previous_stage_id INTEGER,
      new_stage_id INTEGER,
      details_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
      FOREIGN KEY (actor_id) REFERENCES users(id),
      FOREIGN KEY (previous_stage_id) REFERENCES workflow_stages(id),
      FOREIGN KEY (new_stage_id) REFERENCES workflow_stages(id)
    );
  `);

  // Safe ALTER TABLE migrations for pre-existing SQLite database files
  const columns = db.prepare(`PRAGMA table_info(requests)`).all();
  const colNames = columns.map(c => c.name);

  if (!colNames.includes('version')) {
    db.exec(`ALTER TABLE requests ADD COLUMN version INTEGER NOT NULL DEFAULT 1`);
  }
  if (!colNames.includes('is_archived')) {
    db.exec(`ALTER TABLE requests ADD COLUMN is_archived INTEGER NOT NULL DEFAULT 0`);
  }
  if (!colNames.includes('deleted_at')) {
    db.exec(`ALTER TABLE requests ADD COLUMN deleted_at DATETIME`);
  }
}

module.exports = {
  db,
  initSchema
};
