const express = require('express');
const router = express.Router();
const { authMiddleware, roleGuard } = require('../middlewares/auth');
const c = require('../controllers/parcelController');

router.get('/stats', authMiddleware, roleGuard('admin'), c.stats);
router.post('/', authMiddleware, roleGuard('admin'), c.inbound);
router.get('/', authMiddleware, roleGuard('admin'), c.list);
router.get('/search', authMiddleware, c.search);
router.put('/:id/notify', authMiddleware, roleGuard('admin'), c.notify);
router.post('/pickup', authMiddleware, roleGuard('admin'), c.pickup);
router.get('/mine', authMiddleware, c.mine);

module.exports = router;
