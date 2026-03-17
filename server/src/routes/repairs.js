// server/src/routes/repairs.js - 报修管理
const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取报修列表
router.get('/', async (req, res) => {
  try {
    const { status, house_id, page = 1, pageSize = 20 } = req.query;
    let sql = `SELECT r.*, h.community, h.address, t.name as tenant_name, t.phone as tenant_phone 
               FROM repairs r 
               LEFT JOIN houses h ON r.house_id = h.id 
               LEFT JOIN tenants t ON r.tenant_id = t.id 
               WHERE r.is_deleted = 0`;
    let params = [];
    
    // 容错处理
    if (status !== undefined && status !== '' && status !== null) {
      sql += ' AND r.status = ?';
      params.push(parseInt(status));
    }
    if (house_id) {
      sql += ' AND r.house_id = ?';
      params.push(parseInt(house_id));
    }
    
    sql += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize) || 20, ((parseInt(page) || 1) - 1) * (parseInt(pageSize) || 20));
    
    const [rows] = await db.query(sql, params);
    
    // 解析JSON字段（添加容错处理）
    const repairs = rows.map(r => {
      let photos = [];
      try {
        if (r.photos) {
          photos = typeof r.photos === 'string' ? JSON.parse(r.photos) : r.photos;
        }
      } catch(e) {
        photos = [];
      }
      return { ...r, photos };
    });
    
    res.json({ code: 0, data: { list: repairs, total: rows.length } });
  } catch (err) {
    console.error(' repairs query error:', err);
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 获取报修详情
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, h.community, h.address, h.layout, t.name as tenant_name, t.phone as tenant_phone
       FROM repairs r 
       LEFT JOIN houses h ON r.house_id = h.id 
       LEFT JOIN tenants t ON r.tenant_id = t.id 
       WHERE r.id = ? AND r.is_deleted = 0`, 
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ code: 1, message: '报修不存在' });
    }
    const repair = {
      ...rows[0],
      photos: (() => {
        try {
          if (!rows[0].photos) return [];
          return typeof rows[0].photos === 'string' ? JSON.parse(rows[0].photos) : rows[0].photos;
        } catch(e) {
          return [];
        }
      })()
    };
    res.json({ code: 0, data: repair });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 提交报修
router.post('/', async (req, res) => {
  try {
    const { house_id, tenant_id, type, urgency, description, photos, expected_time, remark } = req.body;
    const repairNo = 'BX-' + Date.now();
    
    const [result] = await db.query(
      `INSERT INTO repairs (repair_no, house_id, tenant_id, type, urgency, description, photos, expected_time, remark) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [repairNo, house_id, tenant_id, type, urgency, description, JSON.stringify(photos || []), expected_time, remark || '']
    );
    
    res.json({ code: 0, message: '提交成功', data: { id: result.insertId, repair_no: repairNo } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 更新报修状态
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, handler, cost } = req.body;
    let sql = 'UPDATE repairs SET status = ?';
    let params = [status];
    
    if (handler) {
      sql += ', handler = ?';
      params.push(handler);
    }
    if (cost !== undefined) {
      sql += ', cost = ?';
      params.push(cost);
    }
    
    sql += ' WHERE id = ?';
    params.push(req.params.id);
    
    await db.query(sql, params);
    res.json({ code: 0, message: '状态更新成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 评价报修
router.post('/:id/comment', async (req, res) => {
  try {
    const { rating, comment } = req.body;
    await db.query('UPDATE repairs SET rating = ?, comment = ?, status = 6 WHERE id = ?', [rating, comment, req.params.id]);
    res.json({ code: 0, message: '评价成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 删除报修
router.delete('/:id', async (req, res) => {
  try {
    await db.query('UPDATE repairs SET is_deleted = 1 WHERE id = ?', [req.params.id]);
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
