const axios = require('axios');

async function test() {
  // 租客登录
  const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
    username: '13900001111',
    password: 'admin123',
    loginType: 'tenant'
  });
  const token = loginRes.data.data?.token;
  const user = loginRes.data.data?.user;
  console.log('✅ 登录:', user?.role, user?.name);

  // 测试 /auth/me
  try {
    const res = await axios.get('http://localhost:3000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('\n✅ /auth/me 返回:');
    console.log(JSON.stringify(res.data.data, null, 2));
  } catch (err) {
    console.log('❌ /auth/me 失败:', err.response?.data);
  }
}

test();
