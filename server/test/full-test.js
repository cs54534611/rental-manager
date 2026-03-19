const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

const users = [
  { username: 'admin', password: 'admin123', role: 'super', name: '超级管理员' },
  { username: '13900001111', password: 'admin123', role: 'tenant', name: '租客-李先生' },
];

const tests = [
  { method: 'GET', path: '/health', role: 'public', name: '健康检查' },
  { method: 'GET', path: '/houses', role: 'all', name: '房源列表' },
  { method: 'GET', path: '/tenants', role: 'admin', name: '租客列表' },
  { method: 'GET', path: '/contracts', role: 'all', name: '合同列表' },
  { method: 'GET', path: '/rentals', role: 'all', name: '租金列表' },
  { method: 'GET', path: '/repairs', role: 'all', name: '报修列表' },
  { method: 'GET', path: '/staff', role: 'admin', name: '维修人员列表' },
  { method: 'GET', path: '/stats/overview', role: 'all', name: '统计概览' },
  { method: 'GET', path: '/stats/income', role: 'admin', name: '收入趋势' },
  { method: 'GET', path: '/stats/houses/distribution', role: 'admin', name: '房源分布' },
  { method: 'GET', path: '/settings', role: 'admin', name: '系统设置' },
  { method: 'GET', path: '/settings/owner/info', role: 'all', name: '房东信息' },
  { method: 'GET', path: '/transactions', role: 'admin', name: '交易记录' },
  { method: 'GET', path: '/meter', role: 'repair', name: '抄表记录' },
  { method: 'GET', path: '/payments/channels', role: 'admin', name: '支付渠道' },
  { method: 'GET', path: '/payments/stats', role: 'admin', name: '支付统计' },
  { method: 'GET', path: '/backup', role: 'admin', name: '备份列表' },
];

async function login(username, password) {
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, { username, password });
    return res.data.data.token;
  } catch (err) {
    return null;
  }
}

async function testEndpoint(token, test) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.get(`${BASE_URL}${test.path}`, { headers });
    return { status: res.status, ok: res.data.code === 0 };
  } catch (err) {
    return { status: err.response?.status || 0, ok: false, msg: err.response?.data?.message || err.message };
  }
}

async function runTests() {
  console.log('🚀 API 全面测试\n');
  console.log('='.repeat(60));
  
  console.log('\n📋 获取Token...\n');
  const tokens = {};
  for (const user of users) {
    const token = await login(user.username, user.password);
    tokens[user.role] = token;
    console.log(`  ${user.name}: ${token ? '✅' : '❌'}`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 测试结果\n');
  
  let superPass = 0, superFail = 0;
  let tenantPass = 0, tenantFail = 0;
  
  for (const test of tests) {
    console.log(`\n🔹 ${test.name} (${test.path})`);
    
    if (test.role === 'public') {
      const r = await testEndpoint(null, test);
      console.log(`   公开: ${r.ok ? '✅' : '❌'} (${r.status})`);
      r.ok ? superPass++ : superFail++;
    } 
    else if (test.role === 'admin') {
      const r = await testEndpoint(tokens.super, test);
      console.log(`   超级管理员: ${r.ok ? '✅' : '❌'} (${r.status})`);
      r.ok ? superPass++ : superFail++;
    } 
    else if (test.role === 'all') {
      const r1 = await testEndpoint(tokens.super, test);
      console.log(`   超级管理员: ${r1.ok ? '✅' : '❌'} (${r1.status})`);
      r1.ok ? superPass++ : superFail++;
      
      const r2 = await testEndpoint(tokens.tenant, test);
      console.log(`   租客: ${r2.ok ? '✅' : '❌'} (${r2.status})`);
      r2.ok ? tenantPass++ : tenantFail++;
    }
    else if (test.role === 'repair') {
      const r = await testEndpoint(tokens.super, test);
      console.log(`   超级管理员: ${r.ok ? '✅' : '❌'} (${r.status})`);
      r.ok ? superPass++ : superFail++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📈 汇总');
  console.log(`  超级管理员: ✅ ${superPass} | ❌ ${superFail}`);
  console.log(`  租客: ✅ ${tenantPass} | ❌ ${tenantFail}`);
  console.log('\n✅ 测试完成!');
}

runTests().catch(console.error);
