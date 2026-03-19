// server/src/routes/notify.js - 通知管理
const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取通知模板列表
router.get('/templates', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM notify_templates WHERE enabled = 1');
    res.json({ code: 0, data: rows });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 更新通知模板
router.put('/templates/:type', async (req, res) => {
  try {
    const { template_id, title, content, enabled } = req.body;
    await db.query(
      'UPDATE notify_templates SET template_id=?, title=?, content=?, enabled=? WHERE type=?',
      [template_id, title, content, enabled !== undefined ? enabled : 1, req.params.type]
    );
    res.json({ code: 0, message: '更新成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 创建通知模板
router.post('/templates', async (req, res) => {
  try {
    const { type, template_id, title, content, enabled } = req.body;
    
    // 检查是否已存在
    const [existing] = await db.query('SELECT id FROM notify_templates WHERE type = ?', [type]);
    if (existing.length > 0) {
      return res.status(400).json({ code: 1, message: '模板已存在，请使用PUT更新' });
    }
    
    await db.query(
      'INSERT INTO notify_templates (type, template_id, title, content, enabled) VALUES (?, ?, ?, ?, ?)',
      [type, template_id, title, content, enabled !== undefined ? enabled : 1]
    );
    res.json({ code: 0, message: '创建成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 发送通知（模拟，实际需要对接微信）
router.post('/send', async (req, res) => {
  try {
    const { type, title, content, user_id } = req.body;
    
    // 获取模板
    const [templates] = await db.query('SELECT * FROM notify_templates WHERE type = ?', [type]);
    if (templates.length === 0) {
      return res.status(400).json({ code: 1, message: '模板不存在' });
    }
    
    // 记录通知日志
    const [result] = await db.query(
      'INSERT INTO notify_logs (user_id, type, title, content, status, send_time) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id || 0, type, title || templates[0].title, content || templates[0].content, 1, new Date()]
    );
    
    // TODO: 实际调用微信发送模板消息
    // await wechat.sendTemplateMessage(openid, template_id, data);
    
    res.json({ code: 0, message: '发送成功', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 获取通知记录
router.get('/logs', async (req, res) => {
  try {
    const { user_id, type, page = 1, pageSize = 20 } = req.query;
    let sql = 'SELECT * FROM notify_logs WHERE 1=1';
    let params = [];
    
    if (user_id) {
      sql += ' AND user_id = ?';
      params.push(user_id);
    }
    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }
    
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), (parseInt(page) - 1) * parseInt(pageSize));
    
    const [rows] = await db.query(sql, params);
    res.json({ code: 0, data: rows });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 租金到期提醒（定时任务调用）
router.post('/rent-due-reminder', async (req, res) => {
  try {
    // 查找3天内到期的租金
    const [rentals] = await db.query(`
      SELECT r.*, t.name as tenant_name, t.phone, h.address 
      FROM rentals r
      LEFT JOIN tenants t ON r.tenant_id = t.id
      LEFT JOIN houses h ON r.house_id = h.id
      WHERE r.status = 0 AND r.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 DAY)
    `);
    
    let sent = 0;
    for (const rental of rentals) {
      // 发送通知
      await db.query(
        'INSERT INTO notify_logs (user_id, type, title, content, status, send_time) VALUES (?, ?, ?, ?, ?, ?)',
        [rental.tenant_id, 'rent_due', '租金到期提醒', 
         `您的租金即将到期，请于${rental.due_date}前缴纳租金¥${rental.receivable}`, 
         1, new Date()]
      );
      sent++;
    }
    
    res.json({ code: 0, message: `已发送${sent}条提醒` });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 合同到期提醒
router.post('/contract-expiring-reminder', async (req, res) => {
  try {
    const [contracts] = await db.query(`
      SELECT c.*, t.name as tenant_name, t.phone, h.address 
      FROM contracts c
      LEFT JOIN tenants t ON c.tenant_id = t.id
      LEFT JOIN houses h ON c.house_id = h.id
      WHERE c.status = 1 AND c.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
    `);
    
    let sent = 0;
    for (const contract of contracts) {
      await db.query(
        'INSERT INTO notify_logs (user_id, type, title, content, status, send_time) VALUES (?, ?, ?, ?, ?, ?)',
        [contract.tenant_id, 'contract_expiring', '合同到期提醒',
         `您的合同将于${contract.end_date}到期，请及时处理续签或退房事宜`,
         1, new Date()]
      );
      sent++;
    }
    
    res.json({ code: 0, message: `已发送${sent}条提醒` });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
