// server/src/routes/contracts.js - 合同管理
const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取合同列表
router.get('/', async (req, res) => {
  try {
    const { status, house_id, page = 1, pageSize = 20 } = req.query;
    let sql = `SELECT c.*, h.community, h.address, h.layout, t.name as tenant_name, t.phone as tenant_phone 
               FROM contracts c 
               LEFT JOIN houses h ON c.house_id = h.id 
               LEFT JOIN tenants t ON c.tenant_id = t.id 
               WHERE c.is_deleted = 0`;
    let params = [];
    
    if (status !== undefined && status !== '') {
      sql += ' AND c.status = ?';
      params.push(status);
    }
    if (house_id) {
      sql += ' AND c.house_id = ?';
      params.push(house_id);
    }
    
    sql += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), (parseInt(page) - 1) * parseInt(pageSize));
    
    const [rows] = await db.query(sql, params);
    res.json({ code: 0, data: { list: rows, total: rows.length } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 获取合同详情
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, h.community, h.address, h.layout, t.name as tenant_name, t.phone as tenant_phone 
       FROM contracts c 
       LEFT JOIN houses h ON c.house_id = h.id 
       LEFT JOIN tenants t ON c.tenant_id = t.id 
       WHERE c.id = ? AND c.is_deleted = 0`, 
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ code: 1, message: '合同不存在' });
    }
    res.json({ code: 0, data: rows[0] });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 创建合同
router.post('/', async (req, res) => {
  try {
    const { house_id, tenant_id, type, start_date, end_date, monthly_rent, payment_method, deposit, attachment, remark } = req.body;
    const contractNo = 'HT-' + Date.now();
    
    const [result] = await db.query(
      `INSERT INTO contracts (contract_no, house_id, tenant_id, type, start_date, end_date, monthly_rent, payment_method, deposit, attachment, remark) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [contractNo, house_id, tenant_id, type || 1, start_date, end_date, monthly_rent, payment_method, deposit, attachment || '', remark || '']
    );
    
    // 自动更新房源状态为已出租
    await db.query('UPDATE houses SET status = 1 WHERE id = ?', [house_id]);
    
    res.json({ code: 0, message: '创建成功', data: { id: result.insertId, contract_no: contractNo } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 上传合同附件
router.post('/upload/:id', async (req, res) => {
  try {
    const { attachment } = req.body; // base64 或 URL
    
    if (!attachment) {
      return res.status(400).json({ code: 1, message: '请提供附件内容' });
    }
    
    await db.query('UPDATE contracts SET attachment = ? WHERE id = ?', [attachment, req.params.id]);
    
    res.json({ code: 0, message: '附件上传成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 更新合同
router.put('/:id', async (req, res) => {
  try {
    const { type, start_date, end_date, monthly_rent, payment_method, deposit, attachment, remark, status } = req.body;
    
    await db.query(
      `UPDATE contracts SET type=?, start_date=?, end_date=?, monthly_rent=?, payment_method=?, deposit=?, attachment=?, remark=?, status=? 
       WHERE id=?`,
      [type, start_date, end_date, monthly_rent, payment_method, deposit, attachment || '', remark || '', status || 1, req.params.id]
    );
    
    res.json({ code: 0, message: '更新成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 终止合同
router.delete('/:id', async (req, res) => {
  try {
    // 获取合同信息
    const [rows] = await db.query('SELECT house_id FROM contracts WHERE id = ?', [req.params.id]);
    if (rows.length > 0) {
      // 终止合同
      await db.query('UPDATE contracts SET status = 0 WHERE id = ?', [req.params.id]);
      // 更新房源状态为空置
      await db.query('UPDATE houses SET status = 0 WHERE id = ?', [rows[0].house_id]);
    }
    res.json({ code: 0, message: '合同已终止' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 获取即将到期的合同
router.get('/warning/expiring', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const [rows] = await db.query(
      `SELECT c.*, h.community, h.address, t.name as tenant_name, t.phone as tenant_phone,
       DATEDIFF(c.end_date, CURDATE()) as days_left
       FROM contracts c 
       LEFT JOIN houses h ON c.house_id = h.id 
       LEFT JOIN tenants t ON c.tenant_id = t.id 
       WHERE c.status = 1 AND c.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
       ORDER BY c.end_date ASC`,
      [days]
    );
    res.json({ code: 0, data: rows });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 合同续签
router.post('/renew/:id', async (req, res) => {
  try {
    const oldContractId = req.params.id;
    const { start_date, end_date, monthly_rent, payment_method, deposit, remark } = req.body;
    
    // 获取原合同信息
    const [rows] = await db.query('SELECT * FROM contracts WHERE id = ?', [oldContractId]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 1, message: '原合同不存在' });
    }
    
    const oldContract = rows[0];
    
    // 生成新合同编号（原合同号 + 续）
    const newContractNo = oldContract.contract_no + '-R' + (new Date().getFullYear());
    
    // 创建新合同（type=2 表示续签）
    const [result] = await db.query(
      `INSERT INTO contracts (contract_no, house_id, tenant_id, type, start_date, end_date, monthly_rent, payment_method, deposit, attachment, remark) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newContractNo, oldContract.house_id, oldContract.tenant_id, 2, start_date, end_date, 
       monthly_rent || oldContract.monthly_rent, payment_method || oldContract.payment_method, 
       deposit || oldContract.deposit, oldContract.attachment, remark || ('续签自合同 ' + oldContract.contract_no)]
    );
    
    // 更新原合同状态为已到期（status=3）
    await db.query('UPDATE contracts SET status = 3 WHERE id = ?', [oldContractId]);
    
    res.json({ 
      code: 0, 
      message: '续签成功', 
      data: { 
        id: result.insertId, 
        contract_no: newContractNo,
        old_contract_no: oldContract.contract_no
      } 
    });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 获取合同历史（包含续签记录）
router.get('/history/:house_id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, t.name as tenant_name, t.phone as tenant_phone,
       CASE c.type WHEN 1 THEN '新签' WHEN 2 THEN '续签' WHEN 3 THEN '换房' ELSE '其他' END as type_name,
       CASE c.status WHEN 1 THEN '生效中' WHEN 2 THEN '已退租' WHEN 3 THEN '已到期' ELSE '其他' END as status_name
       FROM contracts c 
       LEFT JOIN tenants t ON c.tenant_id = t.id 
       WHERE c.house_id = ? AND c.is_deleted = 0
       ORDER BY c.created_at DESC`,
      [req.params.house_id]
    );
    res.json({ code: 0, data: rows });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
