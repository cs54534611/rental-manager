// server/src/routes/staff.js - 维修人员管理
const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取维修人员列表
router.get('/', async (req, res) => {
  try {
    const { status, keyword } = req.query;
    let sql = 'SELECT * FROM staff WHERE 1=1';
    let params = [];
    
    if (status !== undefined && status !== '') {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (keyword) {
      sql += ' AND (name LIKE ? OR phone LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    
    sql += ' ORDER BY created_at DESC';
    const [rows] = await db.query(sql, params);
    res.json({ code: 0, data: rows });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 获取维修人员详情
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM staff WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 1, message: '维修人员不存在' });
    }
    res.json({ code: 0, data: rows[0] });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 添加维修人员
router.post('/', async (req, res) => {
  try {
    const { name, phone, specialty, remark } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO staff (name, phone, specialty, remark) VALUES (?, ?, ?, ?)',
      [name, phone, specialty, remark || '']
    );
    
    res.json({ code: 0, message: '添加成功', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 更新维修人员
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, specialty, status, remark } = req.body;
    
    await db.query(
      'UPDATE staff SET name=?, phone=?, specialty=?, status=?, remark=? WHERE id=?',
      [name, phone, specialty, status, remark || '', req.params.id]
    );
    
    res.json({ code: 0, message: '更新成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 删除维修人员
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM staff WHERE id = ?', [req.params.id]);
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 派单给维修人员
router.post('/dispatch/:repair_id', async (req, res) => {
  try {
    const { staff_id } = req.body;
    
    // 获取维修人员信息
    const [staffRows] = await db.query('SELECT name FROM staff WHERE id = ?', [staff_id]);
    if (staffRows.length === 0) {
      return res.status(404).json({ code: 1, message: '维修人员不存在' });
    }
    
    // 更新报修单
    await db.query(
      'UPDATE repairs SET handler = ?, status = 1 WHERE id = ?',
      [staffRows[0].name, req.params.repair_id]
    );
    
    res.json({ code: 0, message: '派单成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
