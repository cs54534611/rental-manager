// server/src/routes/analytics.js - 经营分析大屏
const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取大屏数据
router.get('/dashboard', async (req, res) => {
  try {
    const { year, month } = req.query;
    const now = new Date();
    const targetYear = parseInt(year) || now.getFullYear();
    const targetMonth = parseInt(month) || now.getMonth() + 1;
    const monthStr = String(targetMonth).padStart(2, '0');
    const endOfMonth = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0];

    // 房源统计
    const [houses] = await db.query(`SELECT COUNT(*) as total, SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as rented FROM houses WHERE is_deleted = 0`);
    
    // 本月收入
    const [income] = await db.query(`
      SELECT SUM(actual) as actual, SUM(receivable) as receivable 
      FROM rentals WHERE status = 1 AND DATE_FORMAT(paid_date, '%Y-%m') = ?
    `, [`${targetYear}-${monthStr}`]);

    // 待收租金
    const [pending] = await db.query(`SELECT SUM(receivable) as total, COUNT(*) as count FROM rentals WHERE status IN (0, 2) AND due_date <= ?`, [endOfMonth]);

    // 即将到期合同（30天内）
    const [expiring] = await db.query(`SELECT COUNT(*) as count FROM contracts WHERE status = 1 AND DATEDIFF(end_date, CURDATE()) <= 30 AND DATEDIFF(end_date, CURDATE()) >= 0`);

    // 报修统计
    const [repairs] = await db.query(`SELECT COUNT(*) as pending FROM repairs WHERE status IN (0, 1, 2, 3)`);

    // 近6个月收入趋势
    const [trend] = await db.query(`
      SELECT DATE_FORMAT(paid_date, '%Y-%m') as month, SUM(actual) as income
      FROM rentals WHERE status = 1 AND paid_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(paid_date, '%Y-%m')
      ORDER BY month
    `);

    // 房源类型分布（按装修类型）
    const [distribution] = await db.query(`
      SELECT decoration as type, COUNT(*) as count
      FROM houses WHERE is_deleted = 0
      GROUP BY decoration
    `);

    // 风险预警
    const [warnings] = await db.query(`
      SELECT 'overdue' as type, t.name as tenant_name, h.address, r.receivable, r.due_date, DATEDIFF(CURDATE(), r.due_date) as overdue_days
      FROM rentals r
      LEFT JOIN tenants t ON r.tenant_id = t.id
      LEFT JOIN houses h ON r.house_id = h.id
      WHERE r.status IN (0, 2) AND r.due_date < CURDATE()
      ORDER BY overdue_days DESC
      LIMIT 5
    `);

    const totalHouses = houses[0]?.total || 0;
    const rentedHouses = houses[0]?.rented || 0;

    res.json({
      code: 0,
      data: {
        summary: {
          total_income: income[0]?.actual || 0,
          month_income: income[0]?.actual || 0,
          pending_rentals: pending[0]?.count || 0,
          pending_amount: pending[0]?.total || 0,
          expiring_contracts_30d: expiring[0]?.count || 0,
          pending_repairs: repairs[0]?.pending || 0,
          total_houses: totalHouses,
          rented_houses: rentedHouses,
          occupancy_rate: totalHouses > 0 ? Math.round(rentedHouses / totalHouses * 100) : 0
        },
        charts: {
          income_trend: trend || [],
          room_type_distribution: distribution || []
        },
        warnings: (warnings || []).map(w => ({
          type: 'overdue_rental',
          tenant_name: w.tenant_name,
          house_address: w.address,
          amount: w.receivable,
          overdue_days: w.overdue_days
        }))
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
