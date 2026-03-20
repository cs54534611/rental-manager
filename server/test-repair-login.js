const axios = require('axios');

async function testRepairLogin() {
  // 测试维修人员登录 - 使用普通登录
  try {
    const res = await axios.post('http://localhost:3000/api/auth/login', {
      username: '13800138999',
      password: 'repair123'
    });
    console.log('✅ 维修人员登录成功:', res.data.data.user);
  } catch (err) {
    console.log('❌ 登录失败:', err.response?.data || err.message);
  }
}

testRepairLogin();
