const path = require('path');
const fs = require('fs');
const multer = require('multer');
const config = require('../config');
const { db } = require('../db/schema');
const { logAudit } = require('../services/auditService');

// Multer Storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'doc-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: config.MAX_FILE_SIZE },
  fileFilter: function (req, file, cb) {
    if (config.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed formats: PDF, PNG, JPG, DOCX, XLSX, TXT.'));
    }
  }
}).single('file');

function uploadAttachment(req, res) {
  const { id } = req.params;

  upload(req, res, function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const file = req.file;

    const result = db.prepare(`
      INSERT INTO attachments (request_id, uploaded_by_id, original_name, stored_name, file_path, file_size, mime_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      req.user.id,
      file.originalname,
      file.filename,
      file.path,
      file.size,
      file.mimetype
    );

    logAudit({
      requestId: id,
      actorId: req.user.id,
      action: 'ATTACHMENT_ADDED',
      details: { originalName: file.originalname, fileSize: file.size }
    });

    const attachment = db.prepare(`
      SELECT a.*, u.full_name AS uploader_name
      FROM attachments a
      JOIN users u ON a.uploaded_by_id = u.id
      WHERE a.id = ?
    `).get(result.lastInsertRowid);

    return res.status(201).json({ attachment });
  });
}

function downloadAttachment(req, res) {
  const { attachmentId } = req.params;

  const attachment = db.prepare(`SELECT * FROM attachments WHERE id = ?`).get(attachmentId);
  if (!attachment) {
    return res.status(404).json({ error: 'Attachment not found.' });
  }

  // File access authorization check
  const request = db.prepare(`SELECT requester_id, requester_dept_id FROM requests WHERE id = ?`).get(attachment.request_id);
  const user = req.user;

  if (
    user.role_code !== 'SYSTEM_ADMIN' &&
    user.role_code !== 'OPERATIONS_MANAGER' &&
    request.requester_id !== user.id &&
    request.requester_dept_id !== user.department_id
  ) {
    return res.status(403).json({ error: 'Access denied: You are not authorized to download this attachment.' });
  }

  if (!fs.existsSync(attachment.file_path)) {
    return res.status(404).json({ error: 'File on disk not found.' });
  }

  return res.download(attachment.file_path, attachment.original_name);
}

module.exports = {
  uploadAttachment,
  downloadAttachment
};
