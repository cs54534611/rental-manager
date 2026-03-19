// server/src/routes/settings.js - 系统设置
const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取所有设置
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT `key`, value, remark FROM settings');
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    res.json({ code: 0, data: settings });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 获取单个设置
router.get('/:key', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM settings WHERE `key` = ?', [req.params.key]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 1, message: '设置不存在' });
    }
    res.json({ code: 0, data: rows[0] });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 更新设置
router.put('/', async (req, res) => {
  try {
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await db.query('UPDATE settings SET value = ? WHERE `key` = ?', [value, key]);
    }
    res.json({ code: 0, message: '更新成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 更新单个设置
router.put('/:key', async (req, res) => {
  try {
    const { value } = req.body;
    await db.query('UPDATE settings SET value = ? WHERE `key` = ?', [value, req.params.key]);
    res.json({ code: 0, message: '更新成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 获取房东信息
router.get('/owner/info', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM owners WHERE status = 1 LIMIT 1');
    if (rows.length === 0) {
      return res.status(404).json({ code: 1, message: '房东信息不存在' });
    }
    res.json({ code: 0, data: rows[0] });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 更新房东信息
router.put('/owner/info', async (req, res) => {
  try {
    const { name, phone, avatar, remark } = req.body;
    await db.query('UPDATE owners SET name = ?, phone = ?, avatar = ?, remark = ? WHERE id = 1', [name, phone, avatar, remark]);
    res.json({ code: 0, message: '更新成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 获取提醒设置
router.get('/remind', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT `key`, value FROM settings WHERE `key` IN ('remind_rent_days', 'remind_contract_days')");
    const data = {};
    rows.forEach(r => { data[r.key] = parseInt(r.value) || 0; });
    res.json({ code: 0, data });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 更新提醒设置
router.put('/remind', async (req, res) => {
  try {
    const { remind_rent_days, remind_contract_days } = req.body;
    if (remind_rent_days !== undefined) {
      await db.query("INSERT INTO settings (`key`, value) VALUES ('remind_rent_days', ?) ON DUPLICATE KEY UPDATE value = ?", [remind_rent_days, remind_rent_days]);
    }
    if (remind_contract_days !== undefined) {
      await db.query("INSERT INTO settings (`key`, value) VALUES ('remind_contract_days', ?) ON DUPLICATE KEY UPDATE value = ?", [remind_contract_days, remind_contract_days]);
    }
    res.json({ code: 0, message: '更新成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
