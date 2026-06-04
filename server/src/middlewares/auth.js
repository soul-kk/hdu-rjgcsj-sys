const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.json({ code: 401, message: '未登录', data: null });
  }
  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.json({ code: 401, message: 'token 无效或已过期', data: null });
  }
}

function roleGuard(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.json({ code: 403, message: '无权限', data: null });
    }
    next();
  };
}

module.exports = { authMiddleware, roleGuard };
