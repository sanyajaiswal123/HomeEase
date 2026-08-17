const Notification = require('../models/Notification');

const sendNotification = async (app, { recipient, sender, type, title, message, link }) => {
  try {
    if (!recipient) return null;

    const notif = await Notification.create({
      recipient,
      sender: sender || null,
      type: type || 'system',
      title,
      message,
      link: link || ''
    });

    if (app) {
      const io = app.get('io');
      const connectedUsers = app.get('connectedUsers');
      if (io && connectedUsers) {
        const socketId = connectedUsers.get(recipient.toString());
        if (socketId) {
          io.to(socketId).emit('notification', notif);
        }
      }
    }
    return notif;
  } catch (err) {
    console.error('Failed to create in-app notification:', err.message);
    return null;
  }
};

module.exports = { sendNotification };
