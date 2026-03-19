// server/src/middleware/auth.js - 认证中间件
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'rental-manager-secret-key-change-in-production';

// 角色可访问的模块
const ROLE_MODULES = {
  'super': ['houses', 'tenants', 'contracts', 'rentals', 'repairs', 'staff', 'stats', 'finance', 'backup', 'settings', 'meter', 'checkout', 'transactions', 'admin'],
  'admin': ['houses', 'tenants', 'contracts', 'rentals', 'repairs', 'staff', 'stats', 'finance', 'backup', 'settings', 'meter', 'checkout', 'transactions'],
  'finance': ['houses', 'tenants', 'contracts', 'rentals', 'stats', 'finance', 'transactions'],
  'repair': ['repairs', 'meter'],
  'tenant': ['houses', 'contracts', 'rentals', 'repairs']
};

// 验证token中间件
const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ code: 401, message: '未登录，请先登录' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ code: 401, message: 'token无效或已过期' });
  }
};

// 权限验证中间件
const permission = (module, action) => {
  return (req, res, next) => {
    const { role } = req.user;
    
    // 超级管理员直接通过
    if (role === 'super') {
      return next();
    }
    
    // 检查角色是否有此模块权限
    const allowedModules = ROLE_MODULES[role] || [];
    if (!allowedModules.includes(module)) {
      return res.status(403).json({ code: 403, message: '无权限访问该模块' });
    }
    
    next();
  };
};

// 可选认证（token存在则验证，不存在也允许访问）
const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }
  } catch (err) {
    // ignore
  }
  next();
};

module.exports = { auth, permission, optionalAuth, ROLE_MODULES };
