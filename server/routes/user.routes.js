const router = require('express').Router();
const { getAll, getOne, create, update, toggleStatus, deleteUser } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect, authorize('admin'));

router.route('/').get(getAll).post(create);
router.route('/:id').get(getOne).put(update).delete(deleteUser);
router.patch('/:id/toggle', toggleStatus);

module.exports = router;
