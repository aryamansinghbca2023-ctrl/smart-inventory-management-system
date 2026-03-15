const Category = require('../models/Category');
const Product = require('../models/Product');
const createLog = require('../utils/auditLogger');

// @desc    Get all categories with item counts
// @route   GET /api/categories
exports.getAll = async (req, res) => {
  const categories = await Category.find().sort('name');

  const result = await Promise.all(
    categories.map(async (cat) => {
      const itemCount = await Product.countDocuments({ category: cat._id });
      return { ...cat.toObject(), itemCount };
    })
  );

  res.json({ success: true, categories: result });
};

// @desc    Create category
// @route   POST /api/categories
exports.create = async (req, res) => {
  const { name, color } = req.body;

  const exists = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (exists) return res.status(400).json({ success: false, message: 'Category already exists' });

  const category = await Category.create({ name, color });

  await createLog({
    user: req.user,
    action: 'CREATE',
    module: 'Category',
    details: `Created category: ${name}`,
    ip: req.ip,
  });

  res.status(201).json({ success: true, category: { ...category.toObject(), itemCount: 0 } });
};

// @desc    Update category
// @route   PUT /api/categories/:id
exports.update = async (req, res) => {
  const { name, color } = req.body;

  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

  if (name) category.name = name;
  if (color) category.color = color;
  await category.save();

  await createLog({
    user: req.user,
    action: 'UPDATE',
    module: 'Category',
    details: `Updated category: ${category.name}`,
    ip: req.ip,
  });

  const itemCount = await Product.countDocuments({ category: category._id });
  res.json({ success: true, category: { ...category.toObject(), itemCount } });
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
exports.deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

  const productCount = await Product.countDocuments({ category: req.params.id });
  if (productCount > 0) {
    return res.status(400).json({ success: false, message: 'Cannot delete category that has products assigned to it' });
  }

  await Category.findByIdAndDelete(req.params.id);

  await createLog({
    user: req.user,
    action: 'DELETE',
    module: 'Category',
    details: `Deleted category: ${category.name}`,
    ip: req.ip,
  });

  res.json({ success: true, message: 'Category deleted' });
};
