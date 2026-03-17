// server/src/routes/backup.js - 备份管理
const express = require('express');
const router = express.Router();
const backup = require('../backup');

// 手动备份
router.post('/', async (req, res) => {
  try {
    const filename = req.body.filename;
    const filePath = await backup.backup(filename);
    res.json({ code: 0, message: '备份成功', data: { path: filePath } });
  } catch (err) {
    res.status(500).json({ code: 1, message: '备份失败: ' + err.message });
  }
});

// 列出备份
router.get('/', async (req, res) => {
  try {
    const list = await backup.listBackups();
    res.json({ code: 0, data: list });
  } catch (err) {
    res.status(500).json({ code: 1, message: '获取列表失败: ' + err.message });
  }
});

// 删除备份
router.delete('/:filename', async (req, res) => {
  try {
    await backup.deleteBackup(req.params.filename);
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 1, message: '删除失败: ' + err.message });
  }
});

// 还原备份
router.post('/restore/:filename', async (req, res) => {
  try {
    const { exec } = require('child_process');
    const path = require('path');
    const config = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'rental_db'
    };
    
    const backupPath = path.join(backup.BACKUP_DIR, req.params.filename);
    const command = `mysql -h${config.host} -P${config.port} -u${config.user} -p${config.password} ${config.database} < "${backupPath}"`;
    
    exec(command, (error) => {
      if (error) {
        return res.status(500).json({ code: 1, message: '还原失败: ' + error.message });
      }
      res.json({ code: 0, message: '还原成功' });
    });
  } catch (err) {
    res.status(500).json({ code: 1, message: '还原失败: ' + err.message });
  }
});

module.exports = router;
