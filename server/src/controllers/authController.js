const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function login(req, res) {
  const { username, password, role, phone } = req.body;
  if (!username || !password || !role) {
    return res.json({ code: 1, message: '请填写账号、密码和身份', data: null });
  }
  if (role === 'student' && !phone) {
    return res.json({ code: 1, message: '学生登录需填写手机号', data: null });
  }

  let user = await User.findOne({ where: { username } });

  if (!user) {
    // 账号不存在，自动创建
    user = await User.create({ username, password, role, phone: phone || null });
  } else {
    // 账号存在，校验密码和角色
    if (user.password !== password) {
      return res.json({ code: 1, message: '密码错误', data: null });
    }
    if (user.role !== role) {
      return res.json({ code: 1, message: '身份与账号不匹配', data: null });
    }
    // 如果传了手机号则更新（允许修正）
    if (phone && user.phone !== phone) {
      await user.update({ phone });
    }
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    code: 0,
    message: 'ok',
    data: {
      token,
      user: { id: user.id, username: user.username, role: user.role, real_name: user.real_name, phone: user.phone },
    },
  });
}

async function me(req, res) {
  const user = await User.findByPk(req.user.userId, {
    attributes: ['id', 'username', 'role', 'real_name', 'phone', 'created_at'],
  });
  if (!user) return res.json({ code: 1, message: '用户不存在', data: null });
  return res.json({ code: 0, message: 'ok', data: user });
}

module.exports = { login, me };
