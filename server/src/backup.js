// server/src/backup.js - 数据库备份模块
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '..', 'backups');

// 确保备份目录存在
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * 获取数据库配置
 */
function getDbConfig() {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rental_db'
  };
}

/**
 * 执行备份
 * @param {string} filename - 可选，自定义文件名
 * @returns {Promise<string>} 备份文件路径
 */
function backup(filename) {
  return new Promise((resolve, reject) => {
    const config = getDbConfig();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupFilename = filename || `rental_db_${timestamp}.sql`;
    const backupPath = path.join(BACKUP_DIR, backupFilename);

    const command = `mysqldump -h${config.host} -P${config.port} -u${config.user} -p${config.password} ${config.database} > "${backupPath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('备份失败:', error.message);
        reject(error);
        return;
      }
      console.log(`备份成功: ${backupPath}`);
      resolve(backupPath);
    });
  });
}

/**
 * 列出所有备份文件
 * @returns {Promise<Array>} 备份文件列表
 */
function listBackups() {
  return new Promise((resolve, reject) => {
    fs.readdir(BACKUP_DIR, (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      const backups = files
        .filter(f => f.endsWith('.sql'))
        .map(f => {
          const stats = fs.statSync(path.join(BACKUP_DIR, f));
          return {
            filename: f,
            size: (stats.size / 1024).toFixed(2) + ' KB',
            created: stats.mtime.toISOString()
          };
        })
        .sort((a, b) => new Date(b.created) - new Date(a.created));

      resolve(backups);
    });
  });
}

/**
 * 删除备份文件
 * @param {string} filename - 文件名
 */
function deleteBackup(filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(BACKUP_DIR, filename);
    fs.unlink(filePath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * 清理旧备份，保留最近N个
 * @param {number} keepCount - 保留数量
 */
async function cleanOldBackups(keepCount = 7) {
  const backups = await listBackups();
  const toDelete = backups.slice(keepCount);
  
  for (const backup of toDelete) {
    await deleteBackup(backup.filename);
    console.log(`已删除旧备份: ${backup.filename}`);
  }
}

/**
 * 自动备份调度
 * @param {Object} options - 配置项
 * @param {string} options.cron - Cron表达式，默认每天凌晨2点
 * @param {number} options.keepCount - 保留最近N个备份，默认7
 */
function scheduleBackup(options = {}) {
  const cron = options.cron || '0 2 * * *'; // 每天凌晨2点
  const keepCount = options.keepCount || 7;
  
  // 简单的定时任务实现
  const checkAndBackup = async () => {
    try {
      console.log('开始自动备份...');
      await backup();
      await cleanOldBackups(keepCount);
      console.log('自动备份完成');
    } catch (err) {
      console.error('自动备份失败:', err);
    }
  };

  // 解析cron并执行
  const [minute, hour] = cron.split(' ').slice(0, 2);
  
  setInterval(() => {
    const now = new Date();
    if (now.getHours() === parseInt(hour) && now.getMinutes() === parseInt(minute)) {
      checkAndBackup();
    }
  }, 60000); // 每分钟检查一次

  // 启动时执行一次
  checkAndBackup();
  
  console.log(`自动备份已启用，cron: ${cron}`);
}

module.exports = {
  backup,
  listBackups,
  deleteBackup,
  cleanOldBackups,
  scheduleBackup,
  BACKUP_DIR
};
