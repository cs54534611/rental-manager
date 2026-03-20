const axios = require('axios');
const BASE_URL = 'http://localhost:3000/api';

async function test() {
  console.log('测试维修人员登录...\n');

  // 检查数据库中的用户
  const fs = require('fs');
  const path = require('path');
  const mysql = require('mysql2/promise');

  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Develop@123',
    database: 'rental_db'
  });

  const [users] = await pool.query("SELECT id, username, role, phone FROM admin_users WHERE username='13800138002' OR phone='13800138002'");
  console.log('数据库用户:', users);

  const [tenants] = await pool.query("SELECT id, phone, name FROM tenants WHERE phone='13800138002'");
  console.log('数据库租客:', tenants);

  await pool.end();

  // 尝试登录
  console.log('\n尝试租客登录:');
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      username: '13800138002',
      password: 'repair123',
      loginType: 'tenant'
    });
    console.log('✅ 成功:', res.data);
  } catch (err) {
    console.log('❌ 失败:', err.response?.data || err.message);
  }

  console.log('\n尝试普通登录:');
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      username: '13800138002',
      password: 'repair123'
    });
    console.log('✅ 成功:', res.data);
  } catch (err) {
    console.log('❌ 失败:', err.response?.data || err.message);
  }
}

test().catch(console.error);
