const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userRole: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT'],
    required: true,
  },
  module: {
    type: String,
    required: true,
  },
  details: {
    type: String,
  },
  ip: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
