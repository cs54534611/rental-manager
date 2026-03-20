// server/src/routes/econtracts.js - 在线签约
const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

// 发起合同签署
router.post('/initiate', async (req, res) => {
  try {
    const { contract_id } = req.body;
    
    // 获取合同信息
    const [contracts] = await db.query(`
      SELECT c.*, h.community, h.address, t.name as tenant_name, t.phone as tenant_phone
      FROM contracts c
      LEFT JOIN houses h ON c.house_id = h.id
      LEFT JOIN tenants t ON c.tenant_id = t.id
      WHERE c.id = ?
    `, [contract_id]);
    
    if (contracts.length === 0) return res.status(404).json({ code: 1, message: '合同不存在' });
    
    const contract = contracts[0];
    const uniqueCode = crypto.randomBytes(12).toString('hex').toUpperCase();
    
    await db.query(`
      INSERT INTO econtracts (contract_id, unique_code, status, created_at)
      VALUES (?, ?, 'draft', NOW())
    `, [contract_id, uniqueCode]);
    
    res.json({
      code: 0,
      message: '发起成功',
      data: {
        id: uniqueCode,
        contract_id,
        tenant_name: contract.tenant_name,
        house: `${contract.community} ${contract.address}`,
        monthly_rent: contract.monthly_rent,
        status: 'draft'
      }
    });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 签署合同
router.post('/:id/sign', async (req, res) => {
  try {
    const { id } = req.params;
    const { sign_type } = req.body; // 'initiator' or 'tenant'
    
    const field = sign_type === 'tenant' ? 'tenant_sign' : 'initiator_sign';
    
    await db.query(`UPDATE econtracts SET ${field} = NOW(), status = 'signed' WHERE unique_code = ?`, [id]);
    
    res.json({ code: 0, message: '签署成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 获取合同状态
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.*, c.*, h.community, h.address, t.name as tenant_name
      FROM econtracts e
      LEFT JOIN contracts c ON e.contract_id = c.id
      LEFT JOIN houses h ON c.house_id = h.id
      LEFT JOIN tenants t ON c.tenant_id = t.id
      WHERE e.unique_code = ?
    `, [req.params.id]);
    
    if (rows.length === 0) return res.status(404).json({ code: 1, message: '合同不存在' });
    
    res.json({ code: 0, data: rows[0] });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 合同列表
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `SELECT e.*, c.monthly_rent, h.community, h.address, t.name as tenant_name FROM econtracts e LEFT JOIN contracts c ON e.contract_id = c.id LEFT JOIN houses h ON c.house_id = h.id LEFT JOIN tenants t ON c.tenant_id = t.id WHERE 1=1`;
    const params = [];
    if (status) { sql += ' AND e.status = ?'; params.push(status); }
    sql += ' ORDER BY e.created_at DESC';
    
    const [rows] = await db.query(sql, params);
    res.json({ code: 0, data: rows });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
