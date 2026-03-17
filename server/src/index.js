// server/src/index.js - 主入口
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const housesRouter = require('./routes/houses');
const tenantsRouter = require('./routes/tenants');
const contractsRouter = require('./routes/contracts');
const rentalsRouter = require('./routes/rentals');
const repairsRouter = require('./routes/repairs');
const statsRouter = require('./routes/stats');
const settingsRouter = require('./routes/settings');
const staffRouter = require('./routes/staff');
const backupRouter = require('./routes/backup');
const notifyRouter = require('./routes/notify');
const uploadRouter = require('./routes/upload');
const authRouter = require('./routes/auth');
const { scheduleBackup } = require('./backup');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务（上传的图片）
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// 路由
app.use('/api/houses', housesRouter);
app.use('/api/tenants', tenantsRouter);
app.use('/api/contracts', contractsRouter);
app.use('/api/rentals', rentalsRouter);
app.use('/api/repairs', repairsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/staff', staffRouter);
app.use('/api/backup', backupRouter);
app.use('/api/notify', notifyRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/auth', authRouter);

// 启用自动备份（每天凌晨2点，保留7天）
scheduleBackup({ cron: '0 2 * * *', keepCount: 7 });

// 定时发送通知（每天早上9点检查并发送提醒）
setInterval(async () => {
  const now = new Date();
  if (now.getHours() === 9 && now.getMinutes() === 0) {
    try {
      // 导入db模块发送通知
      const db = require('./db');
      // 租金到期提醒
      await db.query(`
        INSERT INTO notify_logs (user_id, type, title, content, status, send_time)
        SELECT t.id, 'rent_due', '租金到期提醒', 
         CONCAT('您的租金即将到期，请于', r.due_date, '前缴纳租金¥', r.receivable), 1, NOW()
        FROM rentals r
        LEFT JOIN tenants t ON r.tenant_id = t.id
        WHERE r.status = 0 AND r.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 DAY)
      `);
      // 合同到期提醒
      await db.query(`
        INSERT INTO notify_logs (user_id, type, title, content, status, send_time)
        SELECT t.id, 'contract_expiring', '合同到期提醒',
         CONCAT('您的合同将于', c.end_date, '到期，请及时处理'), 1, NOW()
        FROM contracts c
        LEFT JOIN tenants t ON c.tenant_id = t.id
        WHERE c.status = 1 AND c.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
      `);
      console.log('已发送定时通知提醒');
    } catch (err) {
      console.error('定时通知失败:', err);
    }
  }
}, 60000); // 每分钟检查一次

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ code: 500, message: '服务器错误', error: err.message });
});

app.listen(PORT, () => {
  console.log(`租房管理系统 API 服务运行在 http://localhost:${PORT}`);
});
