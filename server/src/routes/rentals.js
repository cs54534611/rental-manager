// server/src/routes/rentals.js - 租金管理
const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取租金列表
router.get('/', async (req, res) => {
  try {
    const { status, house_id, period, page = 1, pageSize = 20 } = req.query;
    let sql = `SELECT r.*, h.community, h.address, t.name as tenant_name 
               FROM rentals r 
               LEFT JOIN houses h ON r.house_id = h.id 
               LEFT JOIN tenants t ON r.tenant_id = t.id 
               WHERE r.is_deleted = 0`;
    let params = [];
    
    // 容错处理：status 可能为空字符串
    if (status !== undefined && status !== '' && status !== null) {
      sql += ' AND r.status = ?';
      params.push(parseInt(status));
    }
    if (house_id) {
      sql += ' AND r.house_id = ?';
      params.push(parseInt(house_id));
    }
    if (period) {
      sql += ' AND r.period = ?';
      params.push(period);
    }
    
    sql += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize) || 20, ((parseInt(page) || 1) - 1) * (parseInt(pageSize) || 20));
    
    const [rows] = await db.query(sql, params);
    res.json({ code: 0, data: { list: rows, total: rows.length } });
  } catch (err) {
    console.error(' rentals query error:', err);
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 获取租金详情
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, h.community, h.address, h.layout, t.name as tenant_name, t.phone as tenant_phone
       FROM rentals r 
       LEFT JOIN houses h ON r.house_id = h.id 
       LEFT JOIN tenants t ON r.tenant_id = t.id 
       WHERE r.id = ? AND r.is_deleted = 0`, 
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ code: 1, message: '账单不存在' });
    }
    res.json({ code: 0, data: rows[0] });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 记收租金
router.post('/', async (req, res) => {
  try {
    const { contract_id, period, receivable, actual, payment_method, paid_date, remark } = req.body;
    
    // 获取合同信息
    const [contracts] = await db.query('SELECT * FROM contracts WHERE id = ?', [contract_id]);
    if (contracts.length === 0) {
      return res.status(404).json({ code: 1, message: '合同不存在' });
    }
    const contract = contracts[0];
    const billNo = 'ZD-' + Date.now();
    
    // 计算到期日
    const dueDate = new Date(period + '-10');
    
    const [result] = await db.query(
      `INSERT INTO rentals (bill_no, contract_id, house_id, tenant_id, period, receivable, actual, payment_method, paid_date, due_date, status, remark) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [billNo, contract_id, contract.house_id, contract.tenant_id, period, receivable, actual, payment_method, paid_date, dueDate, 1, remark || '']
    );
    
    res.json({ code: 0, message: '记收成功', data: { id: result.insertId, bill_no: billNo } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 批量生成账单（每月一日执行）
router.post('/generate', async (req, res) => {
  try {
    const { year, month } = req.body;
    const period = `${year || new Date().getFullYear()}-${String(month || new Date().getMonth() + 1).padStart(2, '0')}`;
    
    // 获取所有生效中的合同
    const [contracts] = await db.query(
      `SELECT c.*, h.rent as house_rent FROM contracts c 
       LEFT JOIN houses h ON c.house_id = h.id 
       WHERE c.status = 1`
    );
    
    let generated = 0;
    for (const contract of contracts) {
      // 检查是否已存在该期间账单
      const [existing] = await db.query('SELECT id FROM rentals WHERE contract_id = ? AND period = ?', [contract.id, period]);
      if (existing.length > 0) continue;
      
      // 根据付款方式计算应收金额
      let receivable = contract.monthly_rent;
      if (contract.payment_method === 1) receivable = contract.monthly_rent * 3; // 押一付三
      if (contract.payment_method === 3) receivable = contract.monthly_rent * 6; // 半年付
      if (contract.payment_method === 4) receivable = contract.monthly_rent * 12; // 年付
      
      const billNo = 'ZD-' + Date.now() + Math.random().toString(36).substr(2, 4);
      const dueDate = new Date(period + '-10');
      
      await db.query(
        `INSERT INTO rentals (bill_no, contract_id, house_id, tenant_id, period, receivable, due_date, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
        [billNo, contract.id, contract.house_id, contract.tenant_id, period, receivable, dueDate]
      );
      generated++;
    }
    
    res.json({ code: 0, message: `成功生成${generated}笔账单`, data: { generated } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 更新租金状态
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE rentals SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ code: 0, message: '状态更新成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 获取待收租金统计
router.get('/stats/pending', async (req, res) => {
  try {
    const [[{ total }]] = await db.query(
      'SELECT SUM(receivable - COALESCE(actual, 0)) as total FROM rentals WHERE status = 0 AND is_deleted = 0'
    );
    const [[{ count }]] = await db.query('SELECT COUNT(*) as count FROM rentals WHERE status = 0 AND is_deleted = 0');
    res.json({ code: 0, data: { total: total || 0, count: count || 0 } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 获取逾期租金列表
router.get('/overdue', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, h.community, h.address, t.name as tenant_name, t.phone as tenant_phone,
       DATEDIFF(CURDATE(), r.due_date) as overdue_days
       FROM rentals r 
       LEFT JOIN houses h ON r.house_id = h.id 
       LEFT JOIN tenants t ON r.tenant_id = t.id 
       WHERE r.status = 0 AND r.due_date < CURDATE() AND r.is_deleted = 0
       ORDER BY overdue_days DESC`
    );
    res.json({ code: 0, data: rows });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 获取租金提醒列表（根据设置的天数）
router.get('/reminder/list', async (req, res) => {
  try {
    // 获取提醒设置
    const [[setting]] = await db.query("SELECT value FROM settings WHERE `key` = 'rent_reminder_days'");
    const reminderDays = setting ? setting.value.split(',').map(d => parseInt(d)) : [7, 3, 1];
    
    const results = [];
    for (const days of reminderDays) {
      const [rows] = await db.query(
        `SELECT r.*, h.community, h.address, t.name as tenant_name, t.phone as tenant_phone,
         DATEDIFF(r.due_date, CURDATE()) as days_until_due
         FROM rentals r 
         LEFT JOIN houses h ON r.house_id = h.id 
         LEFT JOIN tenants t ON r.tenant_id = t.id 
         WHERE r.status = 0 AND DATEDIFF(r.due_date, CURDATE()) = ? AND r.is_deleted = 0`,
        [days]
      );
      if (rows.length > 0) {
        results.push({ days, label: days + '天后到期', bills: rows });
      }
    }
    
    res.json({ code: 0, data: results });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
