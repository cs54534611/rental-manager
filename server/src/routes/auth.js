// server/src/routes/auth.js - 管理员认证
const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'rental-manager-secret-key-change-in-production';
const SALT_ROUNDS = 10;

// 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password, loginType } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ code: 1, message: '请输入用户名和密码' });
    }
    
    let user = null;
    
    // 如果是租客登录（通过手机号）
    if (loginType === 'tenant') {
      try {
        // 先通过手机号查找租客
        const [tenants] = await db.query(
          'SELECT * FROM tenants WHERE phone = ?',
          [username]
        );
        
        if (tenants.length === 0) {
          return res.status(401).json({ code: 1, message: '租客不存在' });
        }
        
        const tenant = tenants[0];
        
        // 再通过手机号查找关联的管理员账号
        const [admins] = await db.query(
          'SELECT * FROM admin_users WHERE phone = ?',
          [username]
        );
        
        if (admins.length === 0) {
          return res.status(401).json({ code: 1, message: '租客账号未绑定，请联系管理员' });
        }
        
        const admin = admins[0];
        
        // 验证密码
        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (!passwordMatch) {
          return res.status(401).json({ code: 1, message: '密码错误' });
        }
        
        user = { id: admin.id, username: tenant.phone, role: 'tenant', name: tenant.name, phone: tenant.phone };
      } catch (err) {
        console.error('租客登录错误:', err);
        return res.status(500).json({ code: 1, message: '登录失败: ' + err.message });
      }
    } else {
      // 管理员登录
      const [rows] = await db.query(
        'SELECT id, username, password, role, name, phone, avatar, status FROM admin_users WHERE username = ?',
        [username]
      );
      
      if (rows.length === 0) {
        return res.status(401).json({ code: 1, message: '用户名或密码错误' });
      }
      
      const row = rows[0];
      
      // 验证密码
      const passwordMatch = await bcrypt.compare(password, row.password);
      if (!passwordMatch) {
        return res.status(401).json({ code: 1, message: '用户名或密码错误' });
      }
      
      if (row.status === 0) {
        return res.status(403).json({ code: 1, message: '账号已被禁用' });
      }
      
      user = { id: row.id, username: row.username, role: row.role, name: row.name };
    }
    
    if (!user) {
      return res.status(401).json({ code: 1, message: '登录失败' });
    }
    
    // 更新最后登录时间
    await db.query('UPDATE admin_users SET last_login = NOW() WHERE id = ?', [user.id]);
    
    // 生成token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      code: 0,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name,
          phone: user.phone || null,
          avatar: null
        }
      }
    });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 注册（仅超级管理员可用）
router.post('/register', async (req, res) => {
  try {
    const { username, password, role, name, phone } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ code: 1, message: '请输入用户名和密码' });
    }
    
    // 检查用户名是否已存在
    const [existing] = await db.query('SELECT id FROM admin_users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ code: 1, message: '用户名已存在' });
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    const [result] = await db.query(
      'INSERT INTO admin_users (username, password, role, name, phone, status) VALUES (?, ?, ?, ?, ?, 1)',
      [username, hashedPassword, role || 'admin', name || '', phone || '']
    );
    
    res.json({ code: 0, message: '注册成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 验证token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ code: 1, message: '未登录' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ code: 0, data: decoded });
  } catch (err) {
    res.status(401).json({ code: 1, message: 'token无效' });
  }
});

// 获取当前用户信息
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ code: 1, message: '未登录' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 获取用户完整信息
    const [rows] = await db.query(
      'SELECT id, username, role, name, phone, avatar FROM admin_users WHERE id = ?',
      [decoded.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ code: 1, message: '用户不存在' });
    }
    
    const user = rows[0];
    
    // 如果是租客，获取租客详细信息
    if (user.role === 'tenant') {
      const [tenants] = await db.query(
        'SELECT id, name, phone, id_card, emergency_contact, emergency_phone FROM tenants WHERE phone = ?',
        [user.phone]
      );
      if (tenants.length > 0) {
        user.tenantInfo = tenants[0];
      }
    }
    
    res.json({ code: 0, data: user });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 获取用户权限
router.get('/permissions', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ code: 1, message: '未登录' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const [perms] = await db.query('SELECT * FROM permissions WHERE role = ?', [decoded.role]);
    
    // 转换为模块权限对象
    const permissions = {};
    perms.forEach(p => {
      permissions[p.module] = p.actions.split(',');
    });
    
    res.json({ code: 0, data: permissions });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 管理员列表（仅超级管理员）
router.get('/users', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.role !== 'super') {
      return res.status(403).json({ code: 1, message: '无权限' });
    }
    
    const [rows] = await db.query(
      'SELECT id, username, role, name, phone, status, last_login, created_at FROM admin_users ORDER BY created_at DESC'
    );
    
    res.json({ code: 0, data: rows });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 添加管理员
router.post('/users', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.role !== 'super') {
      return res.status(403).json({ code: 1, message: '无权限' });
    }
    
    const { username, password, role, name, phone } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ code: 1, message: '请输入用户名和密码' });
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    const [result] = await db.query(
      'INSERT INTO admin_users (username, password, role, name, phone) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, role || 'admin', name, phone]
    );
    
    res.json({ code: 0, message: '添加成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 修改密码
router.put('/password', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ code: 1, message: '请输入旧密码和新密码' });
    }
    
    // 获取当前用户
    const [rows] = await db.query('SELECT password FROM admin_users WHERE id = ?', [decoded.id]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 1, message: '用户不存在' });
    }
    
    // 验证旧密码
    const passwordMatch = await bcrypt.compare(oldPassword, rows[0].password);
    if (!passwordMatch) {
      return res.status(400).json({ code: 1, message: '旧密码错误' });
    }
    
    // 更新密码
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await db.query('UPDATE admin_users SET password = ? WHERE id = ?', [hashedPassword, decoded.id]);
    
    res.json({ code: 0, message: '密码修改成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 更新管理员信息
router.put('/users/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 仅超级管理员可更新
    if (decoded.role !== 'super') {
      return res.status(403).json({ code: 1, message: '无权限' });
    }
    
    const { role, name, phone, status } = req.body;
    const userId = req.params.id;
    
    // 不能修改超级管理员
    const [existing] = await db.query('SELECT username FROM admin_users WHERE id = ?', [userId]);
    if (existing.length === 0) {
      return res.status(404).json({ code: 1, message: '用户不存在' });
    }
    
    if (existing[0].username === 'admin' && decoded.id != userId) {
      return res.status(400).json({ code: 1, message: '不能修改超级管理员' });
    }
    
    await db.query(
      'UPDATE admin_users SET role = ?, name = ?, phone = ?, status = ? WHERE id = ?',
      [role, name, phone, status, userId]
    );
    
    res.json({ code: 0, message: '更新成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 删除管理员
router.delete('/users/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 仅超级管理员可删除
    if (decoded.role !== 'super') {
      return res.status(403).json({ code: 1, message: '无权限' });
    }
    
    const userId = req.params.id;
    
    // 不能删除自己
    if (decoded.id == userId) {
      return res.status(400).json({ code: 1, message: '不能删除自己' });
    }
    
    // 不能删除超级管理员
    const [existing] = await db.query('SELECT username FROM admin_users WHERE id = ?', [userId]);
    if (existing.length > 0 && existing[0].username === 'admin') {
      return res.status(400).json({ code: 1, message: '不能删除超级管理员' });
    }
    
    await db.query('DELETE FROM admin_users WHERE id = ?', [userId]);
    
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 获取当前用户信息
router.get('/current', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ code: 1, message: '未登录' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const [rows] = await db.query(
      'SELECT id, username, role, name, phone, avatar, status, last_login, created_at FROM admin_users WHERE id = ?',
      [decoded.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ code: 1, message: '用户不存在' });
    }
    
    res.json({ code: 0, data: rows[0] });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
