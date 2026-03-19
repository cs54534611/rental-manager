const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testFeatures() {
  console.log('=== 测试新功能 ===\n');
  
  // 1. 测试登录
  console.log('1. 测试管理员登录...');
  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    console.log('   ✅ 登录成功, role:', loginRes.data.data.user.role);
    var token = loginRes.data.data.token;
  } catch (err) {
    console.log('   ❌ 登录失败:', err.response?.data?.message || err.message);
    return;
  }
  
  // 2. 测试房源列表（需要认证）
  console.log('\n2. 测试房源列表...');
  try {
    const housesRes = await axios.get(`${BASE_URL}/houses`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ 获取成功, 数量:', housesRes.data.data.list?.length || 0);
  } catch (err) {
    console.log('   ❌ 获取失败:', err.response?.data?.message || err.message);
  }
  
  // 3. 测试合同列表（需要认证）
  console.log('\n3. 测试合同列表...');
  try {
    const contractsRes = await axios.get(`${BASE_URL}/contracts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ 获取成功, 数量:', contractsRes.data.data.list?.length || 0);
  } catch (err) {
    console.log('   ❌ 获取失败:', err.response?.data?.message || err.message);
  }
  
  // 4. 测试租金列表（需要认证）
  console.log('\n4. 测试租金列表...');
  try {
    const rentalsRes = await axios.get(`${BASE_URL}/rentals`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ 获取成功, 数量:', rentalsRes.data.data.list?.length || 0);
  } catch (err) {
    console.log('   ❌ 获取失败:', err.response?.data?.message || err.message);
  }
  
  // 5. 测试报修列表（需要认证）
  console.log('\n5. 测试报修列表...');
  try {
    const repairsRes = await axios.get(`${BASE_URL}/repairs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ 获取成功, 数量:', repairsRes.data.data.list?.length || 0);
  } catch (err) {
    console.log('   ❌ 获取失败:', err.response?.data?.message || err.message);
  }
  
  // 6. 测试统计概览
  console.log('\n6. 测试统计概览...');
  try {
    const statsRes = await axios.get(`${BASE_URL}/stats/overview`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ 获取成功');
    console.log('   房源总数:', statsRes.data.data.houses?.total || 0);
  } catch (err) {
    console.log('   ❌ 获取失败:', err.response?.data?.message || err.message);
  }
  
  // 7. 测试限流（连续请求）
  console.log('\n7. 测试限流机制...');
  let rateLimited = false;
  for (let i = 0; i < 12; i++) {
    try {
      await axios.get(`${BASE_URL}/health`);
    } catch (err) {
      if (err.response?.status === 429) {
        rateLimited = true;
        console.log('   ✅ 触发限流 (请求 ' + (i + 1) + ')');
        break;
      }
    }
  }
  if (!rateLimited) {
    console.log('   ℹ️ 未触发限流（测试IP白名单）');
  }
  
  // 8. 测试权限验证
  console.log('\n8. 测试权限字段...');
  try {
    const verifyRes = await axios.get(`${BASE_URL}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Token包含角色:', verifyRes.data.data.role);
  } catch (err) {
    console.log('   ❌ 验证失败:', err.response?.data?.message || err.message);
  }
  
  console.log('\n=== 测试完成 ===');
}

testFeatures();
