const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const createLog = require('../utils/auditLogger');

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (user.status === 'inactive') {
    return res.status(403).json({ success: false, message: 'Account is deactivated. Contact admin.' });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  await createLog({
    user: { id: user._id, name: user.name, role: user.role },
    action: 'LOGIN',
    module: 'Auth',
    details: 'User logged in',
    ip: req.ip,
  });

  res.json({
    success: true,
    token: generateToken(user),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
    },
  });
};

// @desc    Logout
// @route   POST /api/auth/logout
exports.logout = async (req, res) => {
  await createLog({
    user: req.user,
    action: 'LOGOUT',
    module: 'Auth',
    details: 'User logged out',
    ip: req.ip,
  });

  res.json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json({ success: true, user });
};
