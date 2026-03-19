// server/src/middleware/logger.js - 请求日志中间件
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');

// 确保日志目录存在
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 请求日志
const logger = (req, res, next) => {
  const start = Date.now();
  const ip = req.ip || req.connection.remoteAddress;
  
  // 响应完成后记录
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      time: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: duration + 'ms',
      ip: ip,
      user: req.user?.username || 'guest',
      userAgent: req.get('user-agent') || ''
    };
    
    // 只记录错误和重要请求
    if (res.statusCode >= 400 || req.originalUrl.includes('/auth/login')) {
      const logFile = path.join(logDir, `access-${log.time.split('T')[0]}.log`);
      fs.appendFileSync(logFile, JSON.stringify(log) + '\n');
    }
  });
  
  next();
};

module.exports = logger;
