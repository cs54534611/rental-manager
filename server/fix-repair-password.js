const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function main() {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Develop@123',
    database: 'rental_db',
    charset: 'utf8mb4'
  });

  // 更新维修人员密码
  const hash = await bcrypt.hash('repair123', 10);
  
  await pool.query(
    "UPDATE admin_users SET password = ? WHERE username = '13800138002'",
    [hash]
  );
  console.log('维修人员密码已更新为: repair123');

  // 验证
  const [users] = await pool.query("SELECT * FROM admin_users WHERE username = '13800138002'");
  console.log('维修人员信息:', users[0]?.username, users[0]?.role, users[0]?.phone);

  await pool.end();
}

main().catch(console.error);
