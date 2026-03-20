// server/src/routes/finance.js - 财务报表
const express = require('express');
const router = express.Router();
const db = require('../db');

// 财务汇总
router.get('/summary', async (req, res) => {
  try {
    const { year, month } = req.query;
    const now = new Date();
    const y = parseInt(year) || now.getFullYear();
    const m = String(parseInt(month) || now.getMonth() + 1).padStart(2, '0');
    const period = `${y}-${m}`;

    const [income] = await db.query(`
      SELECT SUM(actual) as totalIncome, SUM(receivable - actual) as pendingIncome
      FROM rentals WHERE status = 1 AND DATE_FORMAT(paid_date, '%Y-%m') = ?
    `, [period]);

    const [expense] = await db.query(`
      SELECT SUM(amount) as totalExpense FROM expenses
      WHERE DATE_FORMAT(expense_date, '%Y-%m') = ?
    `, [period]);

    const [pendingRentals] = await db.query(`
      SELECT SUM(receivable) as amount, COUNT(*) as count
      FROM rentals WHERE status IN (0, 2) AND due_date <= ?
    `, [`${y}-${m}-31`]);

    res.json({
      code: 0,
      data: {
        period,
        totalIncome: income[0]?.totalIncome || 0,
        pendingIncome: pendingRentals[0]?.amount || 0,
        pendingCount: pendingRentals[0]?.count || 0,
        totalExpense: expense[0]?.totalExpense || 0,
        netIncome: (income[0]?.totalIncome || 0) - (expense[0]?.totalExpense || 0)
      }
    });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 收入明细
router.get('/income', async (req, res) => {
  try {
    const { year, month, page = 1, pageSize = 50 } = req.query;
    const now = new Date();
    const y = parseInt(year) || now.getFullYear();
    const m = String(parseInt(month) || now.getMonth() + 1).padStart(2, '0');
    const period = `${y}-${m}`;

    const [rows] = await db.query(`
      SELECT r.*, h.community, h.address, t.name as tenant_name
      FROM rentals r
      LEFT JOIN houses h ON r.house_id = h.id
      LEFT JOIN tenants t ON r.tenant_id = t.id
      WHERE r.status = 1 AND DATE_FORMAT(r.paid_date, '%Y-%m') = ?
      ORDER BY r.paid_date DESC
      LIMIT ? OFFSET ?
    `, [period, parseInt(pageSize), (parseInt(page) - 1) * parseInt(pageSize)]);

    res.json({ code: 0, data: rows });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 支出记录
router.get('/expense', async (req, res) => {
  try {
    const { year, month, page = 1, pageSize = 50 } = req.query;
    const now = new Date();
    const y = parseInt(year) || now.getFullYear();
    const m = String(parseInt(month) || now.getMonth() + 1).padStart(2, '0');

    const [rows] = await db.query(`
      SELECT * FROM expenses
      WHERE DATE_FORMAT(expense_date, '%Y-%m') = ?
      ORDER BY expense_date DESC
      LIMIT ? OFFSET ?
    `, [`${y}-${m}`, parseInt(pageSize), (parseInt(page) - 1) * parseInt(pageSize)]);

    res.json({ code: 0, data: rows });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
