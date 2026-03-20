// server/src/routes/calendar.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// IMPORTANT: Specific routes must come BEFORE parameterized routes

// 按年获取数据
router.get('/year/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const [contracts] = await db.query(`
      SELECT c.id, c.house_id, c.start_date, c.end_date, c.status,
             h.community, h.address, t.name as tenant_name
      FROM contracts c
      LEFT JOIN houses h ON c.house_id = h.id
      LEFT JOIN tenants t ON c.tenant_id = t.id
      WHERE YEAR(c.start_date) <= ? AND YEAR(c.end_date) >= ? AND c.status = 1
    `, [year, year]);
    
    const houseMap = {};
    contracts.forEach(c => {
      if (!houseMap[c.house_id]) {
        houseMap[c.house_id] = { house_id: c.house_id, community: c.community, address: c.address, contracts: [] };
      }
      houseMap[c.house_id].contracts.push({ id: c.id, tenant_name: c.tenant_name, start_date: c.start_date, end_date: c.end_date });
    });
    
    res.json({ code: 0, data: { year, months: Object.values(houseMap) } });
  } catch (err) { res.status(500).json({ code: 1, message: err.message }); }
});

// 获取所有房源的月度概览
router.get('/overview', async (req, res) => {
  try {
    const { year, month } = req.query;
    const now = new Date();
    const targetYear = parseInt(year) || now.getFullYear();
    const targetMonth = parseInt(month) || now.getMonth() + 1;
    const monthStr = String(targetMonth).padStart(2, '0');
    const startOfMonth = `${targetYear}-${monthStr}-01`;
    const endOfMonth = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0];
    
    const [houses] = await db.query(`
      SELECT h.id, h.community, h.address, h.status as house_status,
             c.id as contract_id, c.start_date, c.end_date, t.name as tenant_name
      FROM houses h
      LEFT JOIN contracts c ON h.id = c.house_id AND c.status = 1 AND c.start_date <= ? AND c.end_date >= ?
      LEFT JOIN tenants t ON c.tenant_id = t.id
      WHERE h.is_deleted = 0 ORDER BY h.id
    `, [endOfMonth, startOfMonth]);
    
    const result = houses.map(h => ({
      house_id: h.id, community: h.community, address: h.address,
      status: (h.house_status === 1 || h.contract_id) ? 'occupied' : 'available',
      tenant_name: h.tenant_name || null
    }));
    
    const occupied = result.filter(r => r.status === 'occupied').length;
    const total = result.length;
    
    res.json({ code: 0, data: { year: targetYear, month: targetMonth, houses: result, stats: { total, occupied, available: total - occupied, occupancyRate: total > 0 ? Math.round(occupied / total * 100) : 0 } } });
  } catch (err) { res.status(500).json({ code: 1, message: err.message }); }
});

// 获取房源日历数据
router.get('/:houseId', async (req, res) => {
  try {
    const { houseId } = req.params;
    const { year, month } = req.query;
    const now = new Date();
    const targetYear = parseInt(year) || now.getFullYear();
    const targetMonth = parseInt(month) || now.getMonth() + 1;
    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
    const endDate = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0];
    
    const [contracts] = await db.query(`
      SELECT c.id, c.start_date, c.end_date, t.name as tenant_name
      FROM contracts c LEFT JOIN tenants t ON c.tenant_id = t.id
      WHERE c.house_id = ? AND c.status = 1 AND c.start_date <= ? AND c.end_date >= ?
      ORDER BY c.start_date
    `, [houseId, endDate, startDate]);
    
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(targetYear, targetMonth - 1, day);
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'][currentDate.getDay()];
      
      let status = 'available';
      let contract = null;
      for (const c of contracts) {
        if (dateStr >= c.start_date && dateStr <= c.end_date) {
          status = 'occupied';
          contract = { id: c.id, tenant_name: c.tenant_name };
          if (dateStr === c.start_date) status = 'checkin';
          else if (dateStr === c.end_date) status = 'checkout';
          break;
        }
      }
      days.push({ day, date: dateStr, dayOfWeek, status, contract });
    }
    
    res.json({ code: 0, data: { house_id: houseId, year: targetYear, month: targetMonth, days, summary: { totalDays: daysInMonth, occupiedDays: days.filter(d => d.status === 'occupied').length, availableDays: days.filter(d => d.status === 'available').length }, prevMonth: { year: targetMonth > 1 ? targetYear : targetYear - 1, month: targetMonth > 1 ? targetMonth - 1 : 12 }, nextMonth: { year: targetMonth < 12 ? targetYear : targetYear + 1, month: targetMonth < 12 ? targetMonth + 1 : 1 } } });
  } catch (err) { res.status(500).json({ code: 1, message: err.message }); }
});

module.exports = router;
