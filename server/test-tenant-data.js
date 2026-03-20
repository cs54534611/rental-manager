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
  console.log('✅ 租客登录:', user?.role, user?.name);

  // 测试租客访问自己的数据
  const endpoints = [
    { path: '/api/houses', name: '房源列表' },
    { path: '/api/contracts', name: '合同列表' },
    { path: '/api/rentals', name: '租金列表' },
    { path: '/api/repairs', name: '报修列表' },
  ];

  for (const ep of endpoints) {
    try {
      const res = await axios.get(`http://localhost:3000${ep.path}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const count = res.data.data?.list?.length || res.data.data?.length || 0;
      console.log(`  ✅ ${ep.name}: ${count} 条数据`);
    } catch (err) {
      console.log(`  ❌ ${ep.name}: ${err.response?.data?.message || err.message}`);
    }
  }
}

test().catch(console.error);
