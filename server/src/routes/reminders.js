// server/src/routes/reminders.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取提醒列表
router.get('/', async (req, res) => {
  try {
    const { status, tenant_id, page = 1, pageSize = 20 } = req.query;
    
    let sql = `
      SELECT r.*, 
             t.name as tenant_name, t.phone as tenant_phone,
             h.community, h.address,
             rent.period, rent.receivable, rent.due_date
      FROM reminders r
      LEFT JOIN tenants t ON r.tenant_id = t.id
      LEFT JOIN houses h ON r.house_id = h.id
      LEFT JOIN rentals rent ON r.rental_id = rent.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status !== undefined) {
      sql += ' AND r.send_status = ?';
      params.push(status);
    }
    if (tenant_id) {
      sql += ' AND r.tenant_id = ?';
      params.push(tenant_id);
    }
    
    sql += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), (parseInt(page) - 1) * parseInt(pageSize));
    
    const [rows] = await db.query(sql, params);
    
    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM reminders WHERE 1=1';
    const countParams = [];
    if (status !== undefined) {
      countSql += ' AND send_status = ?';
      countParams.push(status);
    }
    if (tenant_id) {
      countSql += ' AND tenant_id = ?';
      countParams.push(tenant_id);
    }
    const [countResult] = await db.query(countSql, countParams);
    
    res.json({
      code: 0,
      data: {
        list: rows,
        total: countResult[0].total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (err) {
    console.error('获取提醒列表失败:', err);
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 获取待发送提醒（自动任务调用）
router.get('/pending', async (req, res) => {
  try {
    // 查找所有未支付的租金及其关联信息
    const [rentals] = await db.query(`
      SELECT r.*, 
             t.id as tenant_id, t.name as tenant_name, t.phone as tenant_phone,
             h.id as house_id, h.community, h.address,
             rr.title, rr.content_template, rr.days_before, rr.id as rule_id
      FROM rentals r
      LEFT JOIN tenants t ON r.tenant_id = t.id
      LEFT JOIN houses h ON r.house_id = h.id
      LEFT JOIN reminder_rules rr ON rr.is_enabled = 1
      WHERE r.status IN (0, 2) AND DATEDIFF(r.due_date, CURDATE()) = ABS(rr.days_before)
        AND rr.days_before <= 0
    `);
    
    res.json({ code: 0, data: rentals });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 发送所有待到期提醒
router.post('/send-all', async (req, res) => {
  try {
    // 获取所有启用规则
    const [rules] = await db.query('SELECT * FROM reminder_rules WHERE is_enabled = 1');
    
    let sentCount = 0;
    
    // 遍历每个规则
    for (const rule of rules) {
      // 计算目标日期
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + rule.days_before);
      const dateStr = targetDate.toISOString().split('T')[0];
      
      // 查找该日期到期的未付租金
      const [rentals] = await db.query(`
        SELECT r.*, t.id as tenant_id, t.name as tenant_name, t.phone as tenant_phone,
               h.id as house_id, h.community, h.address
        FROM rentals r
        LEFT JOIN tenants t ON r.tenant_id = t.id
        LEFT JOIN houses h ON r.house_id = h.id
        WHERE r.status IN (0, 2) AND r.due_date = ?
      `, [dateStr]);
      
      // 发送提醒
      for (const rental of rentals) {
        // 替换模板变量
        const content = (rule.content_template || rule.title)
          .replace('{tenant_name}', rental.tenant_name || '')
          .replace('{house_address}', `${rental.community} ${rental.address}`)
          .replace('{period}', rental.period)
          .replace('{amount}', rental.receivable)
          .replace('{due_date}', rental.due_date);
        
        // 检查是否已发送过该规则的通知
        const [existing] = await db.query(
          'SELECT id FROM reminders WHERE rental_id = ? AND rule_id = ?',
          [rental.id, rule.id]
        );
        
        if (existing.length === 0) {
          await db.query(`
            INSERT INTO reminders (rental_id, tenant_id, house_id, rule_id, type, title, content, send_status, send_method, sent_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, NOW())
          `, [rental.id, rental.tenant_id, rental.house_id, rule.id, rule.rule_type, rule.title, content]);
          sentCount++;
        }
      }
    }
    
    res.json({ code: 0, message: `已发送 ${sentCount} 条提醒` });
  } catch (err) {
    console.error('发送提醒失败:', err);
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 发送单条提醒
router.post('/send/:rentalId', async (req, res) => {
  try {
    const { rentalId } = req.params;
    
    // 获取租金详情
    const [rentals] = await db.query(`
      SELECT r.*, t.id as tenant_id, t.name as tenant_name, t.phone as tenant_phone,
             h.id as house_id, h.community, h.address
      FROM rentals r
      LEFT JOIN tenants t ON r.tenant_id = t.id
      LEFT JOIN houses h ON r.house_id = h.id
      WHERE r.id = ?
    `, [rentalId]);
    
    if (rentals.length === 0) {
      return res.status(404).json({ code: 1, message: '租金记录不存在' });
    }
    
    const rental = rentals[0];
    
    // 构造提醒内容
    const title = '[Reminder] Rent Payment Due';
    const content = `Dear ${rental.tenant_name}, your rent for ${rental.community} ${rental.address}, period ${rental.period}, amount ${rental.receivable} is due on ${rental.due_date}. Please pay on time.`;
    
    await db.query(`
      INSERT INTO reminders (rental_id, tenant_id, house_id, type, title, content, send_status, send_method, sent_at)
      VALUES (?, ?, ?, 7, ?, ?, 1, 1, NOW())
    `, [rentalId, rental.tenant_id, rental.house_id, title, content]);
    
    res.json({ code: 0, message: '提醒已发送' });
  } catch (err) {
    console.error('发送提醒失败:', err);
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 获取提醒统计
router.get('/stats', async (req, res) => {
  try {
    // 待发送
    const [pending] = await db.query('SELECT COUNT(*) as count FROM reminders WHERE send_status = 0');
    // 已发送
    const [sent] = await db.query('SELECT COUNT(*) as count FROM reminders WHERE send_status = 1');
    // 已通知
    const [notified] = await db.query('SELECT COUNT(*) as count FROM reminders WHERE send_status = 3');
    
    res.json({
      code: 0,
      data: {
        pending: pending[0].count,
        sent: sent[0].count,
        notified: notified[0].count
      }
    });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 获取提醒规则列表
router.get('/rules', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM reminder_rules ORDER BY days_before');
    res.json({ code: 0, data: rows });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 更新提醒规则
router.put('/rules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_enabled, title, content_template } = req.body;
    
    await db.query(`
      UPDATE reminder_rules SET is_enabled = ?, title = ?, content_template = ?
      WHERE id = ?
    `, [is_enabled, title, content_template, id]);
    
    res.json({ code: 0, message: '规则已更新' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 获取租客提醒设置
router.get('/settings/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const [rows] = await db.query('SELECT * FROM reminder_settings WHERE tenant_id = ?', [tenantId]);
    
    if (rows.length === 0) {
      // 返回默认设置
      return res.json({
        code: 0,
        data: {
          tenant_id: tenantId,
          enable_reminder: 1,
          enable_wechat: 1,
          enable_sms: 0
        }
      });
    }
    
    res.json({ code: 0, data: rows[0] });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 更新租客提醒设置
router.put('/settings/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { enable_reminder, enable_wechat, enable_sms } = req.body;
    
    await db.query(`
      INSERT INTO reminder_settings (tenant_id, enable_reminder, enable_wechat, enable_sms)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        enable_reminder = VALUES(enable_reminder),
        enable_wechat = VALUES(enable_wechat),
        enable_sms = VALUES(enable_sms)
    `, [tenantId, enable_reminder, enable_wechat, enable_sms]);
    
    res.json({ code: 0, message: '设置已更新' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// 标记提醒为已通知
router.put('/:id/mark-notified', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE reminders SET send_status = 3, notified_at = NOW() WHERE id = ?', [id]);
    res.json({ code: 0, message: '已标记为已通知' });
  } catch (err) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

module.exports = router;
