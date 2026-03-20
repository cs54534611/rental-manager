// server/src/routes/feedback.js - 投诉建议
const express = require('express');
const router = express.Router();
const db = require('../db');

// 提交反馈
router.post('/submit', async (req, res) => {
  try {
    const { tenant_id, house_id, type, content, images } = req.body;
    if (!tenant_id || !content) return res.status(400).json({ code: 1, message: '缺少必填参数' });
    
    const [result] = await db.query(`
      INSERT INTO feedback (tenant_id, house_id, type, content, images, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'submitted', NOW())
    `, [tenant_id, house_id || null, type || 'suggestion', content, images ? JSON.stringify(images) : null]);
    
    res.json({ code: 0, message: '提交成功', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 反馈列表
router.get('/', async (req, res) => {
  try {
    const { status, type, page = 1, pageSize = 20 } = req.query;
    
    let sql = `
      SELECT f.*, t.name as tenant_name, h.community, h.address
      FROM feedback f
      LEFT JOIN tenants t ON f.tenant_id = t.id
      LEFT JOIN houses h ON f.house_id = h.id
      WHERE 1=1
    `;
    const params = [];
    if (status) { sql += ' AND f.status = ?'; params.push(status); }
    if (type) { sql += ' AND f.type = ?'; params.push(type); }
    sql += ' ORDER BY f.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), (parseInt(page) - 1) * parseInt(pageSize));
    
    const [rows] = await db.query(sql, params);
    res.json({ code: 0, data: rows });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 回复反馈
router.put('/:id/reply', async (req, res) => {
  try {
    const { reply } = req.body;
    await db.query('UPDATE feedback SET reply = ?, status = "replied", replied_at = NOW() WHERE id = ?', [reply, req.params.id]);
    res.json({ code: 0, message: '回复成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 更新状态
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE feedback SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ code: 0, message: '状态已更新' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
