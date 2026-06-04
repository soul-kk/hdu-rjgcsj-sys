const express = require('express');
const router = express.Router();
const { authMiddleware, roleGuard } = require('../middlewares/auth');
const c = require('../controllers/shipOrderController');

router.post('/', authMiddleware, roleGuard('student'), c.create);
router.get('/', authMiddleware, c.list);
router.get('/courier', authMiddleware, roleGuard('courier'), c.courierList);
router.put('/:id/accept', authMiddleware, roleGuard('admin'), c.accept);
router.get('/:id/voucher', authMiddleware, c.voucher);
router.put('/:id/courier-confirm', authMiddleware, roleGuard('courier'), c.courierConfirm);

module.exports = router;
