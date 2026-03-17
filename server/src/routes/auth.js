// server/src/routes/auth.js - 管理员认证
const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'rental-manager-secret-key';

// 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ code: 1, message: '请输入用户名和密码' });
    }
    
    const [rows] = await db.query(
      'SELECT id, username, role, name, phone, avatar, status FROM admin_users WHERE username = ? AND password = ?',
      [username, password]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ code: 1, message: '用户名或密码错误' });
    }
    
    const user = rows[0];
    
    if (user.status === 0) {
      return res.status(403).json({ code: 1, message: '账号已被禁用' });
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
          phone: user.phone,
          avatar: user.avatar
        }
      }
    });
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
    
    const [result] = await db.query(
      'INSERT INTO admin_users (username, password, role, name, phone) VALUES (?, ?, ?, ?, ?)',
      [username, password, role || 'admin', name, phone]
    );
    
    res.json({ code: 0, message: '添加成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
