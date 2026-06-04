const express = require('express');
const router = express.Router();
const { authMiddleware, roleGuard } = require('../middlewares/auth');
const c = require('../controllers/detainedController');

router.get('/stats', authMiddleware, roleGuard('admin'), c.stats);
router.get('/', authMiddleware, roleGuard('admin'), c.list);
router.post('/:id/return', authMiddleware, roleGuard('admin'), c.returnParcel);

module.exports = router;
