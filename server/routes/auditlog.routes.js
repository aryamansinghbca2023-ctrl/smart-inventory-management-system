const router = require('express').Router();
const { getLogs } = require('../controllers/auditlog.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.get('/', protect, authorize('admin'), getLogs);

module.exports = router;
