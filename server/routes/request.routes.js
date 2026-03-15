const router = require('express').Router();
const { getAll, create, approve, reject } = require('../controllers/request.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.get('/', protect, getAll);
router.post('/', protect, create);
router.put('/:id/approve', protect, authorize('admin', 'manager'), approve);
router.put('/:id/reject', protect, authorize('admin', 'manager'), reject);

module.exports = router;
