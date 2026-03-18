// server/src/routes/checkout.js - 退房检查管理
const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取退房记录
router.get('/', async (req, res) => {
  try {
    const { status, contract_id } = req.query;
    let sql = 'SELECT c.*, ct.house_id, ct.tenant_id, h.address, t.name as tenant_name, t.phone as tenant_phone FROM checkouts c LEFT JOIN contracts ct ON c.contract_id = ct.id LEFT JOIN houses h ON ct.house_id = h.id LEFT JOIN tenants t ON ct.tenant_id = t.id WHERE 1=1';
    let params = [];
    
    if (status !== undefined) { sql += ' AND c.status = ?'; params.push(status); }
    if (contract_id) { sql += ' AND c.contract_id = ?'; params.push(contract_id); }
    
    sql += ' ORDER BY c.apply_date DESC';
    
    const [rows] = await db.query(sql, params);
    res.json({ code: 0, data: rows });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 获取退房详情
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT c.*, ct.house_id, ct.tenant_id, h.address, t.name as tenant_name, t.phone as tenant_phone, ct.contract_no FROM checkouts c LEFT JOIN contracts ct ON c.contract_id = ct.id LEFT JOIN houses h ON ct.house_id = h.id LEFT JOIN tenants t ON ct.tenant_id = t.id WHERE c.id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ code: 1, message: '记录不存在' });
    }
    
    res.json({ code: 0, data: rows[0] });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 申请退房
router.post('/', async (req, res) => {
  try {
    const { contract_id, deposit_expected } = req.body;
    
    // 检查是否有未缴租金
    const [rentals] = await db.query(
      'SELECT COUNT(*) as cnt FROM rentals WHERE contract_id = ? AND status = 0',
      [contract_id]
    );
    
    if (rentals[0].cnt > 0) {
      return res.status(400).json({ code: 1, message: '该合同有未缴租金，请先结清' });
    }
    
    const [result] = await db.query(
      'INSERT INTO checkouts (contract_id, deposit_expected, status) VALUES (?, ?, 0)',
      [contract_id, deposit_expected || 0]
    );
    
    // 更新合同状态
    await db.query('UPDATE contracts SET status = 2 WHERE id = ?', [contract_id]);
    
    res.json({ code: 0, message: '申请成功', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 预约退房时间
router.put('/:id/book', async (req, res) => {
  try {
    const { check_date } = req.body;
    
    await db.query(
      'UPDATE checkouts SET check_date = ?, status = 1 WHERE id = ?',
      [check_date, req.params.id]
    );
    
    res.json({ code: 0, message: '预约成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 完成退房检查
router.put('/:id/complete', async (req, res) => {
  try {
    const { house_photos, checklist, deposit_refund, deposit_deduct, deduct_reason, remark, operator_id } = req.body;
    
    await db.query(
      `UPDATE checkouts SET status = 2, house_photos = ?, checklist = ?, deposit_refund = ?, 
       deposit_deduct = ?, deduct_reason = ?, remark = ?, operator_id = ? WHERE id = ?`,
      [JSON.stringify(house_photos), JSON.stringify(checklist), deposit_refund, deposit_deduct, deduct_reason, remark, operator_id, req.params.id]
    );
    
    // 获取合同信息
    const [checkouts] = await db.query('SELECT contract_id FROM checkouts WHERE id = ?', [req.params.id]);
    if (checkouts.length > 0) {
      // 更新房源为空闲状态
      await db.query(`
        UPDATE houses h SET h.status = 0 WHERE h.id = (SELECT house_id FROM contracts WHERE id = ?)
      `, [checkouts[0].contract_id]);
    }
    
    res.json({ code: 0, message: '完成退房检查' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 取消退房
router.put('/:id/cancel', async (req, res) => {
  try {
    await db.query('UPDATE checkouts SET status = 3 WHERE id = ?', [req.params.id]);
    
    // 恢复合同状态
    const [checkouts] = await db.query('SELECT contract_id FROM checkouts WHERE id = ?', [req.params.id]);
    if (checkouts.length > 0) {
      await db.query('UPDATE contracts SET status = 1 WHERE id = ?', [checkouts[0].contract_id]);
    }
    
    res.json({ code: 0, message: '已取消' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 删除退房记录
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM checkouts WHERE id = ?', [req.params.id]);
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
