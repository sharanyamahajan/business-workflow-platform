const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { 
  getRequests, 
  createRequest, 
  getRequestById, 
  handleWorkflowAction, 
  handleDeleteRequest,
  reassignRequest 
} = require('../controllers/requestController');
const { addComment } = require('../controllers/commentController');
const { uploadAttachment, downloadAttachment } = require('../controllers/attachmentController');
const { db } = require('../db/schema');

// Request Types endpoint
router.get('/types', authenticateToken, (req, res) => {
  const types = db.prepare(`SELECT * FROM request_types ORDER BY name ASC`).all();
  const parsed = types.map(t => ({
    ...t,
    form_schema: JSON.parse(t.form_schema || '{}')
  }));
  return res.json({ requestTypes: parsed });
});

// Main Requests endpoints
router.get('/', authenticateToken, getRequests);
router.post('/', authenticateToken, createRequest);
router.get('/:id', authenticateToken, getRequestById);
router.post('/:id/actions', authenticateToken, handleWorkflowAction);
router.delete('/:id', authenticateToken, handleDeleteRequest);
router.post('/:id/reassign', authenticateToken, reassignRequest);

// Comments
router.post('/:id/comments', authenticateToken, addComment);

// Attachments
router.post('/:id/attachments', authenticateToken, uploadAttachment);
router.get('/attachments/:attachmentId/download', authenticateToken, downloadAttachment);

module.exports = router;
