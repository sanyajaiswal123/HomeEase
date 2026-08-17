const AuditLog = require('../models/AuditLog');

const logAdminAction = async ({ adminId, action, targetType, targetId, details, req }) => {
  try {
    if (!adminId) return;

    let ip = '';
    if (req) {
      ip =
        req.headers['x-forwarded-for'] ||
        req.socket?.remoteAddress ||
        req.ip ||
        '127.0.0.1';
    }

    await AuditLog.create({
      admin: adminId,
      action,
      targetType,
      targetId: targetId ? targetId.toString() : '',
      details: details || {},
      ipAddress: ip
    });
  } catch (err) {
    console.error('Failed to log admin action:', err.message);
  }
};

module.exports = { logAdminAction };
