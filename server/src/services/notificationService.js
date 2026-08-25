const { db } = require('../db/schema');

function createNotification({ userId, requestId, type, title, message }) {
  try {
    const stmt = db.prepare(`
      INSERT INTO notifications (user_id, request_id, type, title, message)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(userId, requestId, type, title, message);
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
}

function getUserNotifications(userId) {
  return db.prepare(`
    SELECT n.*, r.request_number, r.title AS request_title
    FROM notifications n
    JOIN requests r ON n.request_id = r.id
    WHERE n.user_id = ?
    ORDER BY n.created_at DESC
    LIMIT 50
  `).all(userId);
}

function markAsRead(notificationId, userId) {
  return db.prepare(`
    UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?
  `).run(notificationId, userId);
}

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead
};
