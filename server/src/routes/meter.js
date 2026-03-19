// server/src/routes/meter.js - 抄表记录管理
const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取抄表记录
router.get('/', async (req, res) => {
  try {
    const { house_id, period } = req.query;
    let sql = 'SELECT m.*, h.address FROM meter_readings m LEFT JOIN houses h ON m.house_id = h.id WHERE 1=1';
    let params = [];
    
    if (house_id) { sql += ' AND m.house_id = ?'; params.push(house_id); }
    if (period) { sql += ' AND m.period = ?'; params.push(period); }
    
    sql += ' ORDER BY m.period DESC, m.house_id';
    
    const [rows] = await db.query(sql, params);
    res.json({ code: 0, data: rows });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 获取单条记录
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT m.*, h.address FROM meter_readings m LEFT JOIN houses h ON m.house_id = h.id WHERE m.id = ?',
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

// 录入抄表
router.post('/', async (req, res) => {
  try {
    const { house_id, period, water_current, electric_current, water_rate, electric_rate, remark, recorded_by } = req.body;
    
    // 获取上月读数
    const [lastMonth] = await db.query(
      'SELECT water_current, electric_current FROM meter_readings WHERE house_id = ? ORDER BY period DESC LIMIT 1',
      [house_id]
    );
    
    const waterLast = lastMonth.length > 0 ? lastMonth[0].water_current : 0;
    const electricLast = lastMonth.length > 0 ? lastMonth[0].electric_current : 0;
    
    // 计算用量和费用
    const waterUsage = Math.max(0, water_current - waterLast);
    const electricUsage = Math.max(0, electric_current - electricLast);
    const waterFee = waterUsage * (water_rate || 3.5);
    const electricFee = electricUsage * (electric_rate || 0.5);
    const totalFee = waterFee + electricFee;
    
    const [result] = await db.query(
      `INSERT INTO meter_readings (house_id, period, water_last, water_current, water_usage, water_rate, water_fee, 
       electric_last, electric_current, electric_usage, electric_rate, electric_fee, total_fee, remark, recorded_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [house_id, period, waterLast, water_current, waterUsage, water_rate || 3.5, waterFee,
       electricLast, electric_current, electricUsage, electric_rate || 0.5, electricFee, totalFee, remark, recorded_by]
    );
    
    res.json({ code: 0, message: '录入成功', data: { id: result.insertId, waterUsage, electricUsage, totalFee } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 更新抄表记录
router.put('/:id', async (req, res) => {
  try {
    const { water_current, electric_current, water_rate, electric_rate, remark } = req.body;
    
    // 获取当前记录
    const [rows] = await db.query('SELECT * FROM meter_readings WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 1, message: '记录不存在' });
    }
    
    const record = rows[0];
    const waterUsage = Math.max(0, waterCurrent - record.water_last);
    const electricUsage = Math.max(0, electricCurrent - record.electric_last);
    const waterFee = waterUsage * (waterRate || record.water_rate);
    const electricFee = electricUsage * (electricRate || record.electric_rate);
    
    await db.query(
      `UPDATE meter_readings SET water_current=?, water_usage=?, water_rate=?, water_fee=?,
       electric_current=?, electric_usage=?, electric_rate=?, electric_fee=?, total_fee=?, remark=? WHERE id=?`,
      [waterCurrent, waterUsage, waterRate || record.water_rate, waterFee,
       electricCurrent, electricUsage, electricRate || record.electric_rate, electricFee, waterFee + electricFee, remark, req.params.id]
    );
    
    res.json({ code: 0, message: '更新成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 删除记录
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM meter_readings WHERE id = ?', [req.params.id]);
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 获取某房源最新读数
router.get('/latest/:house_id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM meter_readings WHERE house_id = ? ORDER BY period DESC LIMIT 1',
      [req.params.house_id]
    );
    
    res.json({ code: 0, data: rows[0] || null });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 计算费用
router.post('/calculate', async (req, res) => {
  try {
    const { house_id, type, reading } = req.body;
    
    const [lastMonth] = await db.query(
      `SELECT ${type}_current as lastReading FROM meter_readings WHERE house_id = ? ORDER BY period DESC LIMIT 1`,
      [house_id]
    );
    
    const lastReading = lastMonth.length > 0 ? lastMonth[0].lastReading : 0;
    const usage = Math.max(0, reading - lastReading);
    const rate = type === 'water' ? 3.5 : 0.5;
    const fee = usage * rate;
    
    res.json({ code: 0, data: { lastReading, reading, usage, rate, fee } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
