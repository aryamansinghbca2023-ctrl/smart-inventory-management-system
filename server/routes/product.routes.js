const router = require('express').Router();
const { getAll, getOne, create, update, deleteProduct, generateSKU } = require('../controllers/product.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.get('/', protect, getAll);
router.get('/sku/generate', protect, authorize('admin', 'manager'), generateSKU);
router.get('/:id', protect, getOne);
router.post('/', protect, authorize('admin', 'manager'), create);
router.put('/:id', protect, authorize('admin', 'manager'), update);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteProduct);

module.exports = router;
