// server/src/routes/wallet.js - 预付费钱包
const express = require('express');
const router = express.Router();
const db = require('../db');

// 充值
router.post('/topup', async (req, res) => {
  try {
    const { tenant_id, amount } = req.body;
    if (!tenant_id || !amount) return res.status(400).json({ code: 1, message: '参数不完整' });
    
    // 获取或创建钱包
    let [accounts] = await db.query('SELECT * FROM prepaid_accounts WHERE tenant_id = ?', [tenant_id]);
    if (accounts.length === 0) {
      const [result] = await db.query('INSERT INTO prepaid_accounts (tenant_id, balance) VALUES (?, 0)', [tenant_id]);
      accounts = [{ id: result.insertId, tenant_id, balance: 0 }];
    }
    const account = accounts[0];
    
    // 添加充值记录
    await db.query(`
      INSERT INTO prepaid_transactions (account_id, type, amount, balance_before, balance_after)
      VALUES (?, 'topup', ?, ?, ?)
    `, [account.id, amount, account.balance, account.balance + amount]);
    
    // 更新余额
    await db.query('UPDATE prepaid_accounts SET balance = balance + ? WHERE id = ?', [amount, account.id]);
    
    res.json({ code: 0, message: '充值成功', data: { new_balance: account.balance + amount } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 余额查询
router.get('/balance/:tenantId', async (req, res) => {
  try {
    const [accounts] = await db.query('SELECT * FROM prepaid_accounts WHERE tenant_id = ?', [req.params.tenantId]);
    if (accounts.length === 0) return res.json({ code: 0, data: { balance: 0, auto_deduct: false } });
    res.json({ code: 0, data: { balance: accounts[0].balance, auto_deduct: accounts[0].auto_deduct_enabled == 1 } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 交易记录
router.get('/history/:tenantId', async (req, res) => {
  try {
    const [accounts] = await db.query('SELECT id FROM prepaid_accounts WHERE tenant_id = ?', [req.params.tenantId]);
    if (accounts.length === 0) return res.json({ code: 0, data: [] });
    
    const [transactions] = await db.query(`
      SELECT * FROM prepaid_transactions WHERE account_id = ? ORDER BY created_at DESC LIMIT 50
    `, [accounts[0].id]);
    
    res.json({ code: 0, data: transactions });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 设置自动扣款
router.put('/auto-deduct/:tenantId', async (req, res) => {
  try {
    const { enabled } = req.body;
    await db.query('UPDATE prepaid_accounts SET auto_deduct_enabled = ? WHERE tenant_id = ?', [enabled ? 1 : 0, req.params.tenantId]);
    res.json({ code: 0, message: '设置成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
