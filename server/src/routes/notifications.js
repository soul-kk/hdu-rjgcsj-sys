const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const Notification = require('../models/Notification');

// 学生：查询我的通知（按手机号）
router.get('/mine', authMiddleware, async (req, res) => {
  const { phone } = req.query;
  if (!phone) return res.json({ code: 1, message: '请提供手机号', data: null });
  const list = await Notification.findAll({
    where: { user_phone: phone },
    order: [['created_at', 'DESC']],
  });
  return res.json({ code: 0, message: 'ok', data: list });
});

// 标记已读
router.put('/:id/read', authMiddleware, async (req, res) => {
  await Notification.update({ is_read: true }, { where: { id: req.params.id } });
  return res.json({ code: 0, message: 'ok', data: null });
});

// 标记全部已读
router.put('/read-all', authMiddleware, async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.json({ code: 1, message: '请提供手机号', data: null });
  await Notification.update({ is_read: true }, { where: { user_phone: phone } });
  return res.json({ code: 0, message: 'ok', data: null });
});

module.exports = router;
