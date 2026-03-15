const Settings = require('../models/Settings');
const Product = require('../models/Product');
const StockRequest = require('../models/StockRequest');
const AuditLog = require('../models/AuditLog');
const Category = require('../models/Category');
const createLog = require('../utils/auditLogger');

// @desc    Get settings
// @route   GET /api/settings
exports.getSettings = async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  res.json({ success: true, settings });
};

// @desc    Update settings
// @route   PUT /api/settings
exports.updateSettings = async (req, res) => {
  const settings = await Settings.findOneAndUpdate({}, req.body, {
    new: true,
    upsert: true,
    runValidators: true,
  });

  await createLog({
    user: req.user,
    action: 'UPDATE',
    module: 'Settings',
    details: 'System settings updated',
    ip: req.ip,
  });

  res.json({ success: true, settings });
};

// @desc    Reset all data
// @route   POST /api/settings/reset
exports.resetData = async (req, res) => {
  if (req.body.confirm !== 'RESET') {
    return res.status(400).json({ success: false, message: 'Type RESET to confirm' });
  }

  // Delete all data except users
  await Product.deleteMany({});
  await StockRequest.deleteMany({});
  await AuditLog.deleteMany({});

  // Re-seed default categories
  await Category.deleteMany({});
  await Category.insertMany([
    { name: 'Electronics', color: '#3b82f6' },
    { name: 'Furniture', color: '#f59e0b' },
    { name: 'Stationery', color: '#8b5cf6' },
    { name: 'Cleaning', color: '#10b981' },
    { name: 'Pantry', color: '#ef4444' },
  ]);

  // Reset settings to defaults
  await Settings.findOneAndUpdate({}, {
    companyName: 'INVORA Corp',
    currency: '₹',
    timezone: 'Asia/Kolkata',
    lowStockThreshold: 10,
    skuPrefix: 'SKU-',
    itemsPerPage: 10,
    emailLowStock: true,
    emailNewRequest: true,
    emailDailySummary: false,
  }, { upsert: true });

  await createLog({
    user: req.user,
    action: 'CREATE',
    module: 'Settings',
    details: 'System data reset by admin',
    ip: req.ip,
  });

  res.json({ success: true, message: 'All data has been reset successfully' });
};
