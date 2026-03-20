// server/src/routes/services.js - 保洁维修服务
const express = require('express');
const router = express.Router();
const db = require('../db');

// 预约服务
router.post('/book', async (req, res) => {
  try {
    const { house_id, tenant_id, type, description, scheduled_date } = req.body;
    
    if (!house_id || !type || !description) {
      return res.status(400).json({ code: 1, message: '缺少必填参数' });
    }

    const [result] = await db.query(`
      INSERT INTO services (house_id, tenant_id, type, description, scheduled_date, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'booked', NOW())
    `, [house_id, tenant_id || null, type, description, scheduled_date || null]);

    res.json({ code: 0, message: '预约成功', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 服务列表
router.get('/', async (req, res) => {
  try {
    const { status, type, page = 1, pageSize = 20 } = req.query;
    
    let sql = `
      SELECT s.*, h.community, h.address, t.name as tenant_name, st.name as staff_name
      FROM services s
      LEFT JOIN houses h ON s.house_id = h.id
      LEFT JOIN tenants t ON s.tenant_id = t.id
      LEFT JOIN staff st ON s.staff_id = st.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) { sql += ' AND s.status = ?'; params.push(status); }
    if (type) { sql += ' AND s.type = ?'; params.push(type); }
    
    sql += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), (parseInt(page) - 1) * parseInt(pageSize));
    
    const [rows] = await db.query(sql, params);
    
    const [countResult] = await db.query('SELECT COUNT(*) as total FROM services WHERE 1=1' + (status ? ' AND status = ?' : ''), status ? [status] : []);
    
    res.json({ code: 0, data: { list: rows, total: countResult[0].total } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 服务详情
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, h.community, h.address, t.name as tenant_name, st.name as staff_name, st.phone as staff_phone
      FROM services s
      LEFT JOIN houses h ON s.house_id = h.id
      LEFT JOIN tenants t ON s.tenant_id = t.id
      LEFT JOIN staff st ON s.staff_id = st.id
      WHERE s.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) return res.status(404).json({ code: 1, message: '服务不存在' });
    
    res.json({ code: 0, data: rows[0] });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 更新服务状态
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE services SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ code: 0, message: '状态已更新' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 派单
router.put('/:id/dispatch', async (req, res) => {
  try {
    const { staff_id } = req.body;
    await db.query('UPDATE services SET staff_id = ?, status = "assigned" WHERE id = ?', [staff_id, req.params.id]);
    res.json({ code: 0, message: '已派单' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 完成服务
router.put('/:id/complete', async (req, res) => {
  try {
    const { fee, comment } = req.body;
    await db.query('UPDATE services SET status = "completed", fee = ?, comment = ?, completed_at = NOW() WHERE id = ?', [fee || null, comment || '', req.params.id]);
    res.json({ code: 0, message: '服务已完成' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 评价
router.put('/:id/rate', async (req, res) => {
  try {
    const { rating, comment } = req.body;
    await db.query('UPDATE services SET rating = ?, comment = ? WHERE id = ?', [rating, comment || '', req.params.id]);
    res.json({ code: 0, message: '评价已提交' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 取消服务
router.put('/:id/cancel', async (req, res) => {
  try {
    await db.query('UPDATE services SET status = "cancelled" WHERE id = ?', [req.params.id]);
    res.json({ code: 0, message: '已取消' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
