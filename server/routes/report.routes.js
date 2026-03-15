const router = require('express').Router();
const { stockSummary, lowStock, stockMovement } = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect, authorize('admin', 'manager'));

router.get('/stock-summary', stockSummary);
router.get('/low-stock', lowStock);
router.get('/stock-movement', stockMovement);

module.exports = router;
