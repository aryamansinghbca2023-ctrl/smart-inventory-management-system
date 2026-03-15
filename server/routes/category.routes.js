const router = require('express').Router();
const { getAll, create, update, deleteCategory } = require('../controllers/category.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.get('/', protect, getAll);
router.post('/', protect, authorize('admin', 'manager'), create);
router.put('/:id', protect, authorize('admin', 'manager'), update);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteCategory);

module.exports = router;
