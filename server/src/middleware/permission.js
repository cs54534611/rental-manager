// server/src/middleware/permission.js - 细粒度权限验证
const db = require('../db');

// 角色可访问的模块
const ROLE_PERMISSIONS = {
  'super': {
    'houses': ['list', 'add', 'edit', 'delete', 'detail'],
    'tenants': ['list', 'add', 'edit', 'delete', 'detail'],
    'contracts': ['list', 'add', 'edit', 'delete', 'detail', 'renew'],
    'rentals': ['list', 'add', 'edit', 'delete', 'detail', 'generate'],
    'repairs': ['list', 'add', 'edit', 'delete', 'detail', 'status'],
    'staff': ['list', 'add', 'edit', 'delete', 'detail'],
    'stats': ['overview', 'export', 'import'],
    'finance': ['list', 'stats', 'export'],
    'backup': ['list', 'create', 'restore', 'delete'],
    'settings': ['view', 'edit'],
    'meter': ['list', 'add', 'edit', 'delete', 'calculate'],
    'checkout': ['list', 'add', 'edit', 'delete', 'complete'],
    'transactions': ['list', 'add', 'export'],
    'admin': ['list', 'add', 'edit', 'delete', 'password']
  },
  'admin': {
    'houses': ['list', 'add', 'edit', 'delete', 'detail'],
    'tenants': ['list', 'add', 'edit', 'delete', 'detail'],
    'contracts': ['list', 'add', 'edit', 'delete', 'detail', 'renew'],
    'rentals': ['list', 'add', 'edit', 'delete', 'detail', 'generate'],
    'repairs': ['list', 'add', 'edit', 'delete', 'detail', 'status'],
    'staff': ['list', 'add', 'edit', 'delete', 'detail'],
    'stats': ['overview', 'export', 'import'],
    'finance': ['list', 'stats', 'export'],
    'backup': ['list', 'create', 'restore', 'delete'],
    'settings': ['view', 'edit'],
    'meter': ['list', 'add', 'edit', 'delete', 'calculate'],
    'checkout': ['list', 'add', 'edit', 'delete', 'complete'],
    'transactions': ['list', 'add', 'export']
  },
  'finance': {
    'houses': ['list', 'detail'],
    'tenants': ['list', 'detail'],
    'contracts': ['list', 'add', 'detail', 'renew'],
    'rentals': ['list', 'add', 'detail', 'generate'],
    'stats': ['overview', 'export'],
    'finance': ['list', 'stats', 'export'],
    'transactions': ['list', 'add', 'export']
  },
  'repair': {
    'repairs': ['list', 'add', 'edit', 'detail', 'status'],
    'meter': ['list', 'add', 'edit', 'calculate']
  },
  'tenant': {
    'houses': ['list', 'detail'],
    'contracts': ['list', 'detail'],
    'rentals': ['list', 'detail'],
    'repairs': ['list', 'add', 'detail']
  }
};

// 检查用户是否有权限
const checkPermission = (userRole, module, action) => {
  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions) return false;
  
  const modulePerms = permissions[module];
  if (!modulePerms) return false;
  
  return modulePerms.includes(action);
};

// 权限验证中间件工厂
const permission = (module, action) => {
  return (req, res, next => {
    const userRole = req.user?.role || '';
    
    if (checkPermission(userRole, module, action)) {
      next();
    } else {
      res.status(403).json({ 
        code: 403, 
        message: `无权限执行此操作 (${module}/${action})` 
      });
    }
  });
};

// 获取用户权限列表
const getUserPermissions = (userRole) => {
  return ROLE_PERMISSIONS[userRole] || {};
};

module.exports = { 
  permission, 
  checkPermission, 
  getUserPermissions, 
  ROLE_PERMISSIONS 
};
