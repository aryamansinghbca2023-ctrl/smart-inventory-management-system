const User = require('../models/User');
const createLog = require('../utils/auditLogger');

// @desc    Get all users
// @route   GET /api/users
exports.getAll = async (req, res) => {
  const users = await User.find().select('-password').sort('-createdAt');
  res.json({ success: true, users });
};

// @desc    Get single user
// @route   GET /api/users/:id
exports.getOne = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user });
};

// @desc    Create user
// @route   POST /api/users
exports.create = async (req, res) => {
  const { name, email, password, role, status } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ success: false, message: 'Email already exists' });

  const user = await User.create({ name, email, password, role, status });

  await createLog({
    user: req.user,
    action: 'CREATE',
    module: 'User',
    details: `Created user: ${user.name} (${user.role})`,
    ip: req.ip,
  });

  const userObj = user.toObject();
  delete userObj.password;

  res.status(201).json({ success: true, user: userObj });
};

// @desc    Update user
// @route   PUT /api/users/:id
exports.update = async (req, res) => {
  const { name, role, status, email } = req.body;

  // Cannot change own role
  if (req.user.id === req.params.id && role && role !== req.user.role) {
    return res.status(400).json({ success: false, message: 'Cannot change your own role' });
  }

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (status) user.status = status;

  await user.save({ validateBeforeSave: false });

  await createLog({
    user: req.user,
    action: 'UPDATE',
    module: 'User',
    details: `Updated user: ${user.name}`,
    ip: req.ip,
  });

  const userObj = user.toObject();
  delete userObj.password;

  res.json({ success: true, user: userObj });
};

// @desc    Toggle user active/inactive
// @route   PATCH /api/users/:id/toggle
exports.toggleStatus = async (req, res) => {
  if (req.user.id === req.params.id) {
    return res.status(400).json({ success: false, message: 'Cannot deactivate your own account' });
  }

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  user.status = user.status === 'active' ? 'inactive' : 'active';
  await user.save({ validateBeforeSave: false });

  await createLog({
    user: req.user,
    action: 'UPDATE',
    module: 'User',
    details: `Toggled user status: ${user.name} → ${user.status}`,
    ip: req.ip,
  });

  res.json({ success: true, user });
};

// @desc    Delete user
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  if (req.user.id === req.params.id) {
    return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  await createLog({
    user: req.user,
    action: 'DELETE',
    module: 'User',
    details: `Deleted user: ${user.name}`,
    ip: req.ip,
  });

  res.json({ success: true, message: 'User deleted' });
};
