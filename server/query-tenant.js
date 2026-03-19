const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Develop@123',
    database: 'rental_db'
  });
  
  // 使用与admin相同的密码哈希（admin123）
  const adminHash = '$2b$10$PgnyUP/ynhZPCa6Yx9vwoOuNj/sUT4rSWQG.T/gvaAaRWzJyrvJhG';
  
  // 为第一个租客创建登录账号
  await conn.execute(
    'INSERT INTO admin_users (username, password, role, name, phone, status) VALUES (?, ?, ?, ?, ?, ?)',
    ['13900001111', adminHash, 'tenant', '李先生', '13900001111', 1]
  );
  
  console.log('✅ 已创建租客登录账号:');
  console.log('');
  console.log('┌─────────────────────────────┐');
  console.log('│  租客登录信息               │');
  console.log('├─────────────────────────────┤');
  console.log('│  手机号: 13900001111       │');
  console.log('│  密码:   admin123           │');
  console.log('│  登录类型: 租客             │');
  console.log('└─────────────────────────────┘');
  
  await conn.end();
})();
