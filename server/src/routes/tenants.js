// server/src/routes/tenants.js - 租客管理
const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取租客列表
router.get('/', async (req, res) => {
  try {
    const { keyword, status, page = 1, pageSize = 20 } = req.query;
    let sql = 'SELECT * FROM tenants WHERE is_deleted = 0';
    let params = [];
    
    if (status !== undefined && status !== '') {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (keyword) {
      sql += ' AND (name LIKE ? OR phone LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), (parseInt(page) - 1) * parseInt(pageSize));
    
    const [rows] = await db.query(sql, params);
    res.json({ code: 0, data: { list: rows, total: rows.length } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 获取租客详情
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tenants WHERE id = ? AND is_deleted = 0', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 1, message: '租客不存在' });
    }
    res.json({ code: 0, data: rows[0] });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 添加租客
router.post('/', async (req, res) => {
  try {
    const { name, gender, phone, id_card, emergency_contact, emergency_phone, avatar, remark } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO tenants (name, gender, phone, id_card, emergency_contact, emergency_phone, avatar, remark) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, gender, phone, id_card, emergency_contact, emergency_phone, avatar || '', remark || '']
    );
    
    res.json({ code: 0, message: '添加成功', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 更新租客 - 支持部分更新
router.put('/:id', async (req, res) => {
  try {
    const { name, gender, phone, id_card, emergency_contact, emergency_phone, avatar, remark, status } = req.body;
    
    // 构建动态更新语句，只更新传入的字段
    const updates = [];
    const values = [];
    
    if (name !== undefined) { updates.push('name=?'); values.push(name); }
    if (gender !== undefined) { updates.push('gender=?'); values.push(gender); }
    if (phone !== undefined) { updates.push('phone=?'); values.push(phone); }
    if (id_card !== undefined) { updates.push('id_card=?'); values.push(id_card); }
    if (emergency_contact !== undefined) { updates.push('emergency_contact=?'); values.push(emergency_contact); }
    if (emergency_phone !== undefined) { updates.push('emergency_phone=?'); values.push(emergency_phone); }
    if (avatar !== undefined) { updates.push('avatar=?'); values.push(avatar); }
    if (remark !== undefined) { updates.push('remark=?'); values.push(remark); }
    if (status !== undefined) { updates.push('status=?'); values.push(status); }
    
    if (updates.length === 0) {
      return res.json({ code: 0, message: '没有需要更新的字段' });
    }
    
    values.push(req.params.id);
    await db.query(`UPDATE tenants SET ${updates.join(',')} WHERE id=?`, values);
    
    res.json({ code: 0, message: '更新成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 删除租客
router.delete('/:id', async (req, res) => {
  try {
    await db.query('UPDATE tenants SET is_deleted = 1 WHERE id = ?', [req.params.id]);
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
