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

  // Get user
  const [users] = await pool.query("SELECT * FROM admin_users WHERE username = '13900001111'");
  console.log('User:', users[0]?.username, users[0]?.role, users[0]?.phone);

  // Test login via API
  const axios = require('axios');
  try {
    const res = await axios.post('http://localhost:3000/api/auth/login', {
      username: '13900001111',
      password: 'admin123',
      loginType: 'tenant'
    });
    console.log('Login success:', res.data.data?.user);
  } catch (err) {
    console.log('Login failed:', err.response?.data);
  }

  await pool.end();
}

main().catch(console.error);
