const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:3000/api/auth/login', {
      username: '13900001111',
      password: 'admin123',
      loginType: 'tenant'
    });
    console.log('✅ 登录成功:', JSON.stringify(res.data.data, null, 2));
  } catch (err) {
    console.log('❌ 登录失败:', err.response?.data);
  }
}

test();
