const { getUserNotifications, markAsRead } = require('../services/notificationService');

function getNotifications(req, res) {
  const notifications = getUserNotifications(req.user.id);
  const unreadCount = notifications.filter(n => !n.is_read).length;
  return res.json({ notifications, unreadCount });
}

function handleMarkAsRead(req, res) {
  const { id } = req.params;
  markAsRead(id, req.user.id);
  return res.json({ message: 'Notification marked as read.' });
}

module.exports = {
  getNotifications,
  handleMarkAsRead
};
