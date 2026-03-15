const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');
const Settings = require('../models/Settings');

// @desc    Stock summary report
// @route   GET /api/reports/stock-summary
exports.stockSummary = async (req, res) => {
  const settings = await Settings.findOne();
  const threshold = settings?.lowStockThreshold || 10;
  const currency = settings?.currency || '₹';

  const products = await Product.find().populate('category', 'name color').sort('name');

  const report = products.map((p) => {
    p._threshold = threshold;
    return {
      _id: p._id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      quantity: p.quantity,
      unitPrice: p.unitPrice,
      totalValue: p.quantity * p.unitPrice,
      status: p.status,
    };
  });

  const grandTotalValue = report.reduce((sum, p) => sum + p.totalValue, 0);

  res.json({ success: true, products: report, grandTotalValue, currency, threshold });
};

// @desc    Low stock report
// @route   GET /api/reports/low-stock
exports.lowStock = async (req, res) => {
  const settings = await Settings.findOne();
  const threshold = settings?.lowStockThreshold || 10;
  const currency = settings?.currency || '₹';

  const products = await Product.find({ quantity: { $lte: threshold } })
    .populate('category', 'name color')
    .sort('quantity');

  res.json({ success: true, products, threshold, currency });
};

// @desc    Stock movement report (audit log for products)
// @route   GET /api/reports/stock-movement
exports.stockMovement = async (req, res) => {
  const { from, to } = req.query;
  const filter = {
    module: 'Product',
    action: { $in: ['CREATE', 'UPDATE', 'DELETE'] },
  };

  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to + 'T23:59:59.999Z');
  }

  const logs = await AuditLog.find(filter)
    .populate('user', 'name role')
    .sort('-createdAt');

  res.json({ success: true, logs });
};
