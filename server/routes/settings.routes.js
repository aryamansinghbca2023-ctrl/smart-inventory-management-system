const router = require('express').Router();
const { getSettings, updateSettings, resetData } = require('../controllers/settings.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.get('/', protect, getSettings);
router.put('/', protect, authorize('admin'), updateSettings);
router.post('/reset', protect, authorize('admin'), resetData);

module.exports = router;
