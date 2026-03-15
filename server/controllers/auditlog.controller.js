const AuditLog = require('../models/AuditLog');

// @desc    Get audit logs (with filters, pagination)
// @route   GET /api/logs
exports.getLogs = async (req, res) => {
  const { user, action, from, to, page = 1, limit = 15 } = req.query;
  const filter = {};

  if (user) filter.user = user;
  if (action) filter.action = action;

  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to + 'T23:59:59.999Z');
  }

  const perPage = parseInt(limit);
  const total = await AuditLog.countDocuments(filter);
  const logs = await AuditLog.find(filter)
    .populate('user', 'name role')
    .sort('-createdAt')
    .skip((parseInt(page) - 1) * perPage)
    .limit(perPage);

  res.json({
    success: true,
    logs,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / perPage),
  });
};
