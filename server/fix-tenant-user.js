const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function main() {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Develop@123',
    database: 'rental_db'
  });

  // Generate password hash
  const hash = await bcrypt.hash('admin123', 10);
  console.log('Password hash:', hash);

  // Check if tenant exists
  const [tenants] = await pool.query("SELECT * FROM tenants WHERE phone = '13900001111'");
  console.log('Tenant:', tenants);

  // Check if admin user exists
  const [admins] = await pool.query("SELECT * FROM admin_users WHERE phone = '13900001111'");
  console.log('Admin user:', admins);

  // Insert admin user for tenant
  try {
    const [result] = await pool.query(
      "INSERT INTO admin_users (username, password, role, name, phone, status) VALUES (?, ?, ?, ?, ?, ?)",
      ['13900001111', hash, 'tenant', '李先生', '13900001111', 1]
    );
    console.log('Insert result:', result);
  } catch (err) {
    console.log('Insert error:', err.message);
  }

  // Verify
  const [users] = await pool.query("SELECT id, username, phone, role FROM admin_users WHERE phone = '13900001111'");
  console.log('Final user:', users);

  await pool.end();
}

main().catch(console.error);
