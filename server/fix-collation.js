const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Develop@123',
    database: 'rental_db'
  });
  
  // 修复字符集
  await conn.execute('ALTER TABLE tenants MODIFY phone VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  await conn.execute('ALTER TABLE admin_users MODIFY phone VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  
  console.log('✅ 字符集修复完成');
  
  await conn.end();
})();
