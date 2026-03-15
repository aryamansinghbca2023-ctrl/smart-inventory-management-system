const Product = require('../models/Product');
const Category = require('../models/Category');
const Settings = require('../models/Settings');
const StockRequest = require('../models/StockRequest');
const createLog = require('../utils/auditLogger');

// @desc    Get all products (with search, filter, pagination)
// @route   GET /api/products
exports.getAll = async (req, res) => {
  const { search, category, status, page = 1, limit } = req.query;

  const settings = await Settings.findOne();
  const threshold = settings?.lowStockThreshold || 10;
  const perPage = parseInt(limit) || settings?.itemsPerPage || 10;

  const filter = {};

  // Search by name or SKU
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
    ];
  }

  // Filter by category
  if (category) {
    filter.category = category;
  }

  // Filter by computed status
  if (status === 'in_stock') filter.quantity = { $gt: threshold };
  else if (status === 'low_stock') filter.quantity = { $gt: 0, $lte: threshold };
  else if (status === 'out_of_stock') filter.quantity = 0;

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate('category', 'name color')
    .sort('-createdAt')
    .skip((parseInt(page) - 1) * perPage)
    .limit(perPage);

  // Attach threshold for virtual status computation
  products.forEach(p => { p._threshold = threshold; });

  res.json({
    success: true,
    products,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / perPage),
    threshold,
  });
};

// @desc    Get single product
// @route   GET /api/products/:id
exports.getOne = async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name color');
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product });
};

// @desc    Create product
// @route   POST /api/products
exports.create = async (req, res) => {
  const { name, sku, category, quantity, unitPrice, supplier, description } = req.body;

  // Check SKU uniqueness
  const skuExists = await Product.findOne({ sku: sku.toUpperCase() });
  if (skuExists) return res.status(400).json({ success: false, message: 'SKU already exists' });

  // Verify category exists
  const cat = await Category.findById(category);
  if (!cat) return res.status(400).json({ success: false, message: 'Invalid category' });

  const product = await Product.create({ name, sku, category, quantity, unitPrice, supplier, description });
  const populated = await product.populate('category', 'name color');

  await createLog({
    user: req.user,
    action: 'CREATE',
    module: 'Product',
    details: `Added product: ${name} (qty: ${quantity})`,
    ip: req.ip,
  });

  res.status(201).json({ success: true, product: populated });
};

// @desc    Generate unique SKU
// @route   GET /api/products/sku/generate
exports.generateSKU = async (req, res) => {
  const settings = await Settings.findOne();
  const prefix = settings?.skuPrefix || 'SKU-';
  let sku;
  let unique = false;

  while (!unique) {
    sku = `${prefix}${Date.now().toString().slice(-6)}`;
    const exists = await Product.findOne({ sku: sku.toUpperCase() });
    if (!exists) unique = true;
  }

  res.json({ success: true, sku: sku.toUpperCase() });
};

// @desc    Update product
// @route   PUT /api/products/:id
exports.update = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const { name, sku, category, quantity, unitPrice, supplier, description } = req.body;

  // If SKU is changing, check uniqueness
  if (sku && sku.toUpperCase() !== product.sku) {
    const skuExists = await Product.findOne({ sku: sku.toUpperCase() });
    if (skuExists) return res.status(400).json({ success: false, message: 'SKU already exists' });
  }

  if (name !== undefined) product.name = name;
  if (sku !== undefined) product.sku = sku;
  if (category !== undefined) product.category = category;
  if (quantity !== undefined) product.quantity = quantity;
  if (unitPrice !== undefined) product.unitPrice = unitPrice;
  if (supplier !== undefined) product.supplier = supplier;
  if (description !== undefined) product.description = description;

  await product.save();
  const populated = await product.populate('category', 'name color');

  await createLog({
    user: req.user,
    action: 'UPDATE',
    module: 'Product',
    details: `Updated product: ${product.name}`,
    ip: req.ip,
  });

  res.json({ success: true, product: populated });
};

// @desc    Delete product
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  // Check for pending stock requests
  const pendingRequests = await StockRequest.countDocuments({ product: req.params.id, status: 'pending' });
  if (pendingRequests > 0) {
    return res.status(400).json({ success: false, message: 'Cannot delete product with pending stock requests' });
  }

  await Product.findByIdAndDelete(req.params.id);

  await createLog({
    user: req.user,
    action: 'DELETE',
    module: 'Product',
    details: `Deleted product: ${product.name}`,
    ip: req.ip,
  });

  res.json({ success: true, message: 'Product deleted' });
};
