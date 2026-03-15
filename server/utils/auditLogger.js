const AuditLog = require('../models/AuditLog');

const createLog = async ({ user, action, module, details, ip }) => {
  await AuditLog.create({
    user: user.id,
    userName: user.name,
    userRole: user.role,
    action,
    module,
    details,
    ip: ip || '127.0.0.1',
  });
};

module.exports = createLog;
