// server/src/index.js - 主入口
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const housesRouter = require('./routes/houses');
const tenantsRouter = require('./routes/tenants');
const contractsRouter = require('./routes/contracts');
const rentalsRouter = require('./routes/rentals');
const repairsRouter = require('./routes/repairs');
const statsRouter = require('./routes/stats');
const settingsRouter = require('./routes/settings');
const staffRouter = require('./routes/staff');
const backupRouter = require('./routes/backup');
const { scheduleBackup } = require('./backup');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// 启用自动备份（每天凌晨2点，保留7天）
scheduleBackup({ cron: '0 2 * * *', keepCount: 7 });

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
