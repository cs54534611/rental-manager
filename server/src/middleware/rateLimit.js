// server/src/middleware/rateLimit.js - 请求限流中间件
const rateLimit = {};

// 默认配置
const defaultConfig = {
  windowMs: 60 * 1000, // 1分钟
  maxRequests: 100 // 每分钟最多100次
};

// 简单限流实现
const rateLimiter = (config = defaultConfig) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimit[ip]) {
      rateLimit[ip] = {
        count: 0,
        resetTime: now + config.windowMs
      };
    }
    
    // 检查是否需要重置
    if (now > rateLimit[ip].resetTime) {
      rateLimit[ip] = {
        count: 0,
        resetTime: now + config.windowMs
      };
    }
    
    rateLimit[ip].count++;
    
    // 设置响应头
    res.set('X-RateLimit-Limit', config.maxRequests);
    res.set('X-RateLimit-Remaining', Math.max(0, config.maxRequests - rateLimit[ip].count));
    res.set('X-RateLimit-Reset', Math.ceil(rateLimit[ip].resetTime / 1000));
    
    if (rateLimit[ip].count > config.maxRequests) {
      return res.status(429).json({ 
        code: 429, 
        message: '请求过于频繁，请稍后再试' 
      });
    }
    
    next();
  };
};

// 清理过期记录（每5分钟）
setInterval(() => {
  const now = Date.now();
  for (const ip in rateLimit) {
    if (now > rateLimit[ip].resetTime + 60000) {
      delete rateLimit[ip];
    }
  }
}, 5 * 60 * 1000);

module.exports = rateLimiter;
