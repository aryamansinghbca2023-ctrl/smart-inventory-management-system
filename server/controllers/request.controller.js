const StockRequest = require('../models/StockRequest');
const Product = require('../models/Product');
const createLog = require('../utils/auditLogger');

// @desc    Get all requests (employee sees own, admin/manager sees all)
// @route   GET /api/requests
exports.getAll = async (req, res) => {
  const { status } = req.query;
  const filter = {};

  // Employee sees only their own
  if (req.user.role === 'employee') {
    filter.requestedBy = req.user.id;
  }

  if (status) filter.status = status;

  const requests = await StockRequest.find(filter)
    .populate('product', 'name sku')
    .populate('requestedBy', 'name role')
    .populate('reviewedBy', 'name')
    .sort('-createdAt');

  const total = requests.length;

  res.json({ success: true, requests, total });
};

// @desc    Create stock request
// @route   POST /api/requests
exports.create = async (req, res) => {
  const { product: productId, quantity, reason } = req.body;

  const product = await Product.findById(productId);
  if (!product) return res.status(400).json({ success: false, message: 'Product not found' });

  const request = await StockRequest.create({
    product: productId,
    requestedBy: req.user.id,
    quantity,
    reason,
  });

  const populated = await request.populate([
    { path: 'product', select: 'name sku' },
    { path: 'requestedBy', select: 'name role' },
  ]);

  await createLog({
    user: req.user,
    action: 'CREATE',
    module: 'Request',
    details: `Stock request raised for: ${product.name} (qty: ${quantity})`,
    ip: req.ip,
  });

  res.status(201).json({ success: true, request: populated });
};

// @desc    Approve stock request
// @route   PUT /api/requests/:id/approve
exports.approve = async (req, res) => {
  const request = await StockRequest.findById(req.params.id).populate('product', 'name sku');
  if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

  if (request.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Only pending requests can be approved' });
  }

  request.status = 'approved';
  request.reviewedBy = req.user.id;
  request.reviewNote = req.body.reviewNote || '';
  request.reviewedAt = Date.now();
  await request.save();

  // Increment product quantity
  await Product.findByIdAndUpdate(request.product._id, {
    $inc: { quantity: request.quantity },
  });

  await createLog({
    user: req.user,
    action: 'APPROVE',
    module: 'Request',
    details: `Approved request for ${request.product.name}, qty: ${request.quantity}`,
    ip: req.ip,
  });

  const populated = await request.populate([
    { path: 'product', select: 'name sku' },
    { path: 'requestedBy', select: 'name role' },
    { path: 'reviewedBy', select: 'name' },
  ]);

  res.json({ success: true, request: populated });
};

// @desc    Reject stock request
// @route   PUT /api/requests/:id/reject
exports.reject = async (req, res) => {
  const request = await StockRequest.findById(req.params.id).populate('product', 'name sku');
  if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

  if (request.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Only pending requests can be rejected' });
  }

  if (!req.body.reviewNote || !req.body.reviewNote.trim()) {
    return res.status(400).json({ success: false, message: 'Rejection reason is required' });
  }

  request.status = 'rejected';
  request.reviewedBy = req.user.id;
  request.reviewNote = req.body.reviewNote;
  request.reviewedAt = Date.now();
  await request.save();

  await createLog({
    user: req.user,
    action: 'REJECT',
    module: 'Request',
    details: `Rejected request for ${request.product.name}. Reason: ${req.body.reviewNote}`,
    ip: req.ip,
  });

  const populated = await request.populate([
    { path: 'product', select: 'name sku' },
    { path: 'requestedBy', select: 'name role' },
    { path: 'reviewedBy', select: 'name' },
  ]);

  res.json({ success: true, request: populated });
};
