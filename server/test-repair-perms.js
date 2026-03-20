const axios = require('axios');
const BASE_URL = 'http://localhost:3000/api';

async function login(username, password) {
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, { username, password });
    return res.data.data?.token;
  } catch (err) {
    return null;
  }
}

async function testEndpoint(token, method, path) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.get(`${BASE_URL}${path}`, { headers });
    return { ok: res.data.code === 0, status: res.status };
  } catch (err) {
    return { ok: false, status: err.response?.status || 0, error: err.response?.data?.message };
  }
}

async function runTests() {
  console.log('🔧 维修人员权限测试\n');

  // 1. 管理员登录
  const adminToken = await login('admin', 'admin123');
  console.log('1. 管理员登录:', adminToken ? '✅' : '❌');

  // 2. 维修人员登录 (手机号 + loginType=tenant)
  const repairToken = await login('13800138002', 'repair123');
  console.log('2. 维修人员登录:', repairToken ? '✅' : '❌');

  if (!repairToken) {
    // 尝试普通登录
    const repairToken2 = await axios.post(`${BASE_URL}/auth/login`, {
      username: '13800138002',
      password: 'repair123'
    }).then(r => r.data.data?.token).catch(() => null);
    console.log('   (普通登录重试:', repairToken2 ? '✅' : '❌', ')');
  }

  // 3. 测试维修人员权限
  console.log('\n📊 维修人员权限测试:');

  // 应该有权访问的API (repairs, meter)
  const repairEndpoints = [
    { path: '/repairs', name: '报修列表', expected: true },
    { path: '/meter', name: '抄表记录', expected: true },
    { path: '/houses', name: '房源列表', expected: false },
    { path: '/tenants', name: '租客列表', expected: false },
    { path: '/staff', name: '维修人员列表', expected: false },
  ];

  for (const ep of repairEndpoints) {
    const r = await testEndpoint(repairToken, 'GET', ep.path);
    const icon = r.ok === ep.expected ? '✅' : '❌';
    console.log(`   ${icon} ${ep.name} (${ep.path}): ${r.ok ? '可访问' : '拒绝'} (预期: ${ep.expected ? '可访问' : '拒绝'})`);
  }

  // 4. 管理员添加维修人员
  console.log('\n📋 管理员操作测试:');
  try {
    const staffData = { name: '王师傅', phone: '13800138003', specialty: '管道维修' };
    const r = await axios.post(`${BASE_URL}/staff`, staffData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('   ✅ 添加维修人员: 成功');
  } catch (err) {
    console.log('   ❌ 添加维修人员:', err.response?.data?.message || err.message);
  }

  // 5. 获取维修人员列表
  try {
    const r = await axios.get(`${BASE_URL}/staff`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`   ✅ 维修人员列表: ${r.data.data.length} 人`);
    r.data.data.forEach(s => console.log(`      - ${s.name} (${s.phone}) - ${s.specialty}`));
  } catch (err) {
    console.log('   ❌ 获取列表:', err.response?.data?.message || err.message);
  }

  console.log('\n✅ 测试完成!');
}

runTests().catch(console.error);
