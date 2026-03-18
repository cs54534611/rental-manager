// server/src/routes/payments.js - 支付管理
const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// 获取可用支付渠道
router.get('/channels', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, channel_type, channel_name, is_enabled FROM payment_channels WHERE is_enabled = 1'
    );
    res.json({ code: 0, data: rows });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 创建支付订单
router.post('/create', async (req, res) => {
  try {
    const { rental_id, channel, tenant_id } = req.body;
    
    if (!rental_id || !channel || !tenant_id) {
      return res.status(400).json({ code: 1, message: '参数不完整' });
    }
    
    // 查询租金信息
    const [rental] = await db.query(
      'SELECT r.*, h.address, t.name as tenant_name FROM rentals r \
       LEFT JOIN houses h ON r.house_id = h.id \
       LEFT JOIN tenants t ON r.tenant_id = t.id \
       WHERE r.id = ? AND r.is_deleted = 0',
      [rental_id]
    );
    
    if (!rental || rental.length === 0) {
      return res.status(404).json({ code: 1, message: '租金不存在' });
    }
    
    const rentalData = rental[0];
    
    // 生成支付流水号
    const payment_no = `PAY${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    
    // 创建支付记录
    await db.query(
      `INSERT INTO payments (payment_no, rental_id, tenant_id, house_id, amount, channel, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [payment_no, rental_id, tenant_id, rentalData.house_id, rentalData.receivable, channel]
    );
    
    // 根据渠道返回支付参数（模拟）
    let payParams = {
      payment_no,
      amount: rentalData.receivable,
      channel,
      description: `${rentalData.address} - ${rentalData.period}租金`
    };
    
    // 实际对接时，这里调用微信/支付宝SDK
    if (channel === 'wechat') {
      // payParams = await wechatPay.createOrder({ ... });
      payParams.prepay_id = `wx${Date.now()}`;
    } else if (channel === 'alipay') {
      // payParams = await alipay.createOrder({ ... });
      payParams.orderStr = `alipay${Date.now()}`;
    }
    
    res.json({ code: 0, data: payParams });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 查询支付状态
router.get('/status/:paymentNo', async (req, res) => {
  try {
    const { paymentNo } = req.params;
    const [rows] = await db.query(
      'SELECT p.*, r.period, h.address FROM payments p \
       LEFT JOIN rentals r ON p.rental_id = r.id \
       LEFT JOIN houses h ON p.house_id = h.id \
       WHERE p.payment_no = ?',
      [paymentNo]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ code: 1, message: '支付记录不存在' });
    }
    
    res.json({ code: 0, data: rows[0] });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 支付回调
router.post('/notify', async (req, res) => {
  try {
    const { channel, payment_no, status, transaction_id } = req.body;
    
    // 验签（实际需验证签名）
    // if (!verifySign(req.body)) {
    //   return res.send('FAIL');
    // }
    
    const [payment] = await db.query('SELECT * FROM payments WHERE payment_no = ?', [payment_no]);
    
    if (payment.length === 0) {
      return res.send('FAIL');
    }
    
    // 更新支付状态
    let newStatus = status === 'success' ? 'success' : 'failed';
    await db.query(
      `UPDATE payments SET status = ?, transaction_id = ?, pay_time = NOW(), notify_data = ? 
       WHERE payment_no = ?`,
      [newStatus, transaction_id, JSON.stringify(req.body), payment_no]
    );
    
    // 如果支付成功，更新租金状态
    if (newStatus === 'success' && payment[0].rental_id) {
      await db.query(
        `UPDATE rentals SET status = 1, actual = receivable, paid_date = CURDATE() 
         WHERE id = ?`,
        [payment[0].rental_id]
      );
      
      // 记录收入交易
      await db.query(
        `INSERT INTO transactions (type, category, amount, house_id, tenant_id, related_id, related_type, remark)
         VALUES ('income', '租金', ?, ?, ?, ?, 'rental', '在线支付')`,
        [payment[0].amount, payment[0].house_id, payment[0].tenant_id, payment[0].rental_id]
      );
    }
    
    res.send('SUCCESS');
  } catch (err) {
    console.error('支付回调处理失败:', err);
    res.send('FAIL');
  }
});

// 支付记录列表
router.get('/list', async (req, res) => {
  try {
    const { tenant_id, status, start_date, end_date, page = 1, limit = 20 } = req.query;
    
    let sql = `SELECT p.*, h.address, t.name as tenant_name, r.period 
               FROM payments p 
               LEFT JOIN houses h ON p.house_id = h.id 
               LEFT JOIN tenants t ON p.tenant_id = t.id 
               LEFT JOIN rentals r ON p.rental_id = r.id 
               WHERE 1=1`;
    const params = [];
    
    if (tenant_id) {
      sql += ' AND p.tenant_id = ?';
      params.push(tenant_id);
    }
    if (status) {
      sql += ' AND p.status = ?';
      params.push(status);
    }
    if (start_date) {
      sql += ' AND DATE(p.created_at) >= ?';
      params.push(start_date);
    }
    if (end_date) {
      sql += ' AND DATE(p.created_at) <= ?';
      params.push(end_date);
    }
    
    sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    
    const [rows] = await db.query(sql, params);
    
    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM payments WHERE 1=1';
    const countParams = [];
    if (tenant_id) { countSql += ' AND tenant_id = ?'; countParams.push(tenant_id); }
    if (status) { countSql += ' AND status = ?'; countParams.push(status); }
    const [[{ total }]] = await db.query(countSql, countParams);
    
    res.json({ 
      code: 0, 
      data: { 
        list: rows, 
        total, 
        page: parseInt(page), 
        limit: parseInt(limit) 
      } 
    });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 退款
router.post('/refund', async (req, res) => {
  try {
    const { payment_id, reason } = req.body;
    
    const [payment] = await db.query('SELECT * FROM payments WHERE id = ?', [payment_id]);
    
    if (payment.length === 0) {
      return res.status(404).json({ code: 1, message: '支付记录不存在' });
    }
    
    if (payment[0].status !== 'success') {
      return res.status(400).json({ code: 1, message: '该订单不支持退款' });
    }
    
    // 实际退款调用
    // let refundResult = await wechatRefund(payment[0]);
    
    // 模拟退款成功
    await db.query(
      "UPDATE payments SET status = 'refunded', remark = ? WHERE id = ?",
      [reason, payment_id]
    );
    
    // 更新租金状态为未付
    if (payment[0].rental_id) {
      await db.query(
        `UPDATE rentals SET status = 0, actual = NULL, paid_date = NULL WHERE id = ?`,
        [payment[0].rental_id]
      );
    }
    
    res.json({ code: 0, message: '退款成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 统计报表
router.get('/stats', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    // 总收入
    const [[totalIncomeResult]] = await db.query(
      "SELECT COALESCE(SUM(amount), 0) as totalIncome FROM payments WHERE status = 'success'"
    );
    
    // 本月收入
    const [[monthIncomeResult]] = await db.query(
      "SELECT COALESCE(SUM(amount), 0) as monthIncome FROM payments WHERE status = 'success' AND MONTH(pay_time) = MONTH(NOW()) AND YEAR(pay_time) = YEAR(NOW())"
    );
    
    // 待收金额
    const [[pendingAmountResult]] = await db.query(
      "SELECT COALESCE(SUM(receivable - COALESCE(actual, 0)), 0) as pendingAmount FROM rentals WHERE status = 0"
    );
    
    // 支付方式统计
    const [channelStats] = await db.query(
      "SELECT channel, COUNT(*) as count, SUM(amount) as amount FROM payments WHERE status = 'success' GROUP BY channel"
    );
    
    // 每日收入趋势（最近30天）
    const [trend] = await db.query(
      "SELECT DATE(pay_time) as date, SUM(amount) as amount FROM payments WHERE status = 'success' AND pay_time >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY DATE(pay_time) ORDER BY date"
    );
    
    res.json({
      code: 0,
      data: {
        totalIncome: totalIncomeResult?.totalIncome || 0,
        monthIncome: monthIncomeResult?.monthIncome || 0,
        pendingAmount: pendingAmountResult?.pendingAmount || 0,
        channelStats: channelStats || [],
        trend: trend || []
      }
    });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
