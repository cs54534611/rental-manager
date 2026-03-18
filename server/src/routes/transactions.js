// server/src/routes/transactions.js - 财务管理
const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取收支列表
router.get('/', async (req, res) => {
  try {
    const { type, category, house_id, start_date, end_date, page = 1, pageSize = 20 } = req.query;
    
    let sql = 'SELECT t.*, h.address, tenant.name as tenant_name FROM transactions t LEFT JOIN houses h ON t.house_id = h.id LEFT JOIN tenants tenant ON t.tenant_id = tenant.id WHERE 1=1';
    let params = [];
    
    if (type) { sql += ' AND t.type = ?'; params.push(type); }
    if (category) { sql += ' AND t.category = ?'; params.push(category); }
    if (house_id) { sql += ' AND t.house_id = ?'; params.push(house_id); }
    if (start_date) { sql += ' AND t.created_at >= ?'; params.push(start_date); }
    if (end_date) { sql += ' AND t.created_at <= ?'; params.push(end_date + ' 23:59:59'); }
    
    sql += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), (parseInt(page) - 1) * parseInt(pageSize));
    
    const [rows] = await db.query(sql, params);
    res.json({ code: 0, data: rows });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 添加收支记录
router.post('/', async (req, res) => {
  try {
    const { type, category, amount, house_id, tenant_id, related_id, related_type, remark, operator_id } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO transactions (type, category, amount, house_id, tenant_id, related_id, related_type, remark, operator_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [type, category, amount, house_id, tenant_id, related_id, related_type, remark, operator_id]
    );
    
    // 如果是租金收入，自动更新租金状态
    if (related_type === 'rental' && type === 'income') {
      await db.query('UPDATE rentals SET status = 1, pay_date = NOW() WHERE id = ?', [related_id]);
    }
    
    res.json({ code: 0, message: '添加成功', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 删除记录
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM transactions WHERE id = ?', [req.params.id]);
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 统计报表
router.get('/stats', async (req, res) => {
  try {
    const { year, month } = req.query;
    let dateFilter = '';
    if (year && month) {
      dateFilter = ` AND YEAR(created_at) = ${year} AND MONTH(created_at) = ${month}`;
    } else if (year) {
      dateFilter = ` AND YEAR(created_at) = ${year}`;
    }
    
    // 总收入
    const [income] = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income'${dateFilter}`
    );
    
    // 总支出
    const [expense] = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense'${dateFilter}`
    );
    
    // 按类别统计收入
    const [incomeByCategory] = await db.query(
      `SELECT category, SUM(amount) as total FROM transactions WHERE type = 'income'${dateFilter} GROUP BY category`
    );
    
    // 按类别统计支出
    const [expenseByCategory] = await db.query(
      `SELECT category, SUM(amount) as total FROM transactions WHERE type = 'expense'${dateFilter} GROUP BY category`
    );
    
    // 月度趋势（近12个月）
    const [monthlyTrend] = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month
    `);
    
    res.json({
      code: 0,
      data: {
        totalIncome: income[0].total,
        totalExpense: expense[0].total,
        profit: income[0].total - expense[0].total,
        incomeByCategory,
        expenseByCategory,
        monthlyTrend
      }
    });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 房源收益排行
router.get('/ranking', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        h.id, h.address,
        SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) as total_income,
        SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) as total_expense,
        COUNT(DISTINCT t.tenant_id) as tenant_count
      FROM houses h
      LEFT JOIN transactions t ON h.id = t.house_id
      GROUP BY h.id
      ORDER BY total_income DESC
      LIMIT 10
    `);
    
    res.json({ code: 0, data: rows });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
