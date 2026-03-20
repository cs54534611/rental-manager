const mysql = require('mysql2/promise');

async function main() {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Develop@123',
    database: 'rental_db',
    charset: 'utf8mb4'
  });

  // Get admin user info
  const [users] = await pool.query("SELECT * FROM admin_users WHERE username = '13900001111'");
  console.log('=== 管理员账号信息 ===');
  if (users[0]) {
    console.log('ID:', users[0].id);
    console.log('用户名:', users[0].username);
    console.log('姓名:', users[0].name);
    console.log('手机:', users[0].phone);
    console.log('角色:', users[0].role);
  }

  // Get tenant info
  const [tenants] = await pool.query("SELECT * FROM tenants WHERE phone = '13900001111'");
  console.log('\n=== 租客信息 ===');
  if (tenants[0]) {
    console.log('ID:', tenants[0].id);
    console.log('姓名:', tenants[0].name);
    console.log('手机:', tenants[0].phone);
    console.log('身份证:', tenants[0].id_card);
    console.log('性别:', tenants[0].gender === 1 ? '男' : '女');
  }

  // Get contracts for this tenant
  if (tenants[0]) {
    const [contracts] = await pool.query("SELECT * FROM contracts WHERE tenant_id = ?", [tenants[0].id]);
    console.log('\n=== 合同信息 ===');
    console.log('合同数量:', contracts.length);
  }

  await pool.end();
}

main().catch(console.error);
