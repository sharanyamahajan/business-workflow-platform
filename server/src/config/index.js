const path = require('path');
const os = require('os');
require('dotenv').config();

const isVercel = process.env.VERCEL || process.env.NOW_BUILDER;
const defaultDbPath = isVercel 
  ? path.join(os.tmpdir(), 'database.sqlite')
  : path.join(__dirname, '../../database.sqlite');
const defaultUploadDir = isVercel 
  ? path.join(os.tmpdir(), 'uploads')
  : path.join(__dirname, '../../uploads');

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'workflow_secret_key_2026_antigravity_platform',
  JWT_EXPIRES_IN: '7d',
  DB_FILE: process.env.DB_FILE || defaultDbPath,
  UPLOAD_DIR: process.env.UPLOAD_DIR || defaultUploadDir,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]
};
