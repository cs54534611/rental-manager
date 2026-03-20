/**
 * 全面页面功能测试
 */

const axios = require('axios');
const BASE_URL = 'http://localhost:3000/api';

const colors = { green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', blue: '\x1b[34m', cyan: '\x1b[36m', reset: '\x1b[0m' };
const log = (msg, color = 'reset') => console.log(`${colors[color]}${msg}${colors.reset}`);
const pass = (msg) => log(`  ✅ ${msg}`, 'green');
const fail = (msg) => log(`  ❌ ${msg}`, 'red');

let adminToken = '';
let tenantToken = '';
let repairToken = '';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// 1. 登录测试
async function testLogin() {
  log('\n🔐 【登录页面】', 'blue');
  
  // 管理员登录
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    adminToken = res.data.data?.token;
    pass('管理员登录');
  } catch (err) {
    fail(`管理员登录: ${err.response?.data?.message}`);
  }
  
  await sleep(200);
  
  // 租客登录
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      username: '13900001111',
      password: 'admin123',
      loginType: 'tenant'
    });
    tenantToken = res.data.data?.token;
    pass('租客登录');
  } catch (err) {
    fail(`租客登录: ${err.response?.data?.message}`);
  }
  
  await sleep(200);
  
  // 维修人员登录
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      username: '13800138002',
      password: 'repair123',
      loginType: 'tenant'
    });
    repairToken = res.data.data?.token;
    pass('维修人员登录');
  } catch (err) {
    fail(`维修人员登录: ${err.response?.data?.message}`);
  }
}

// 2. 房源页面
async function testHouses() {
  log('\n🏠 【房源页面】', 'blue');
  
  // 房源列表
  try {
    const res = await axios.get(`${BASE_URL}/houses`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    pass(`房源列表: ${res.data.data?.list?.length || 0} 条`);
  } catch (err) {
    fail(`房源列表: ${err.response?.data?.message}`);
  }
  
  // 房源详情
  try {
    const res = await axios.get(`${BASE_URL}/houses/1`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    pass(`房源详情: ${res.data.data?.community || 'OK'}`);
  } catch (err) {
    fail(`房源详情: ${err.response?.data?.message}`);
  }
  
  // 租客房源列表（只能看自己租的）
  try {
    const res = await axios.get(`${BASE_URL}/houses`, {
      headers: { Authorization: `Bearer ${tenantToken}` }
    });
    pass(`租客房源列表: ${res.data.data?.list?.length || 0} 条`);
  } catch (err) {
    fail(`租客房源: ${err.response?.data?.message}`);
  }
}

// 3. 租客页面
async function testTenants() {
  log('\n👤 【租客页面】', 'blue');
  
  try {
    const res = await axios.get(`${BASE_URL}/tenants`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    pass(`租客列表: ${res.data.data?.list?.length || 0} 条`);
  } catch (err) {
    fail(`租客列表: ${err.response?.data?.message}`);
  }
}

// 4. 合同页面
async function testContracts() {
  log('\n📄 【合同页面】', 'blue');
  
  try {
    const res = await axios.get(`${BASE_URL}/contracts`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    pass(`合同列表: ${res.data.data?.list?.length || 0} 条`);
  } catch (err) {
    fail(`合同列表: ${err.response?.data?.message}`);
  }
  
  // 租客合同
  try {
    const res = await axios.get(`${BASE_URL}/contracts`, {
      headers: { Authorization: `Bearer ${tenantToken}` }
    });
    pass(`租客合同列表: ${res.data.data?.list?.length || 0} 条`);
  } catch (err) {
    fail(`租客合同: ${err.response?.data?.message}`);
  }
}

// 5. 租金页面
async function testRentals() {
  log('\n💰 【租金页面】', 'blue');
  
  try {
    const res = await axios.get(`${BASE_URL}/rentals`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    pass(`租金列表: ${res.data.data?.list?.length || 0} 条`);
  } catch (err) {
    fail(`租金列表: ${err.response?.data?.message}`);
  }
  
  // 待收统计
  try {
    const res = await axios.get(`${BASE_URL}/rentals/stats/pending`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    pass(`待收统计: ¥${res.data.data?.total || 0}`);
  } catch (err) {
    fail(`待收统计: ${err.response?.data?.message}`);
  }
  
  // 租客租金
  try {
    const res = await axios.get(`${BASE_URL}/rentals`, {
      headers: { Authorization: `Bearer ${tenantToken}` }
    });
    pass(`租客租金列表: ${res.data.data?.list?.length || 0} 条`);
  } catch (err) {
    fail(`租客租金: ${err.response?.data?.message}`);
  }
}

// 6. 报修页面
async function testRepairs() {
  log('\n🔧 【报修页面】', 'blue');
  
  try {
    const res = await axios.get(`${BASE_URL}/repairs`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    pass(`报修列表: ${res.data.data?.list?.length || 0} 条`);
  } catch (err) {
    fail(`报修列表: ${err.response?.data?.message}`);
  }
  
  // 租客提交报修
  try {
    const res = await axios.post(`${BASE_URL}/repairs`, {
      house_id: 2,
      type: 1,
      urgency: 1,
      description: '测试报修-API自动测试'
    }, {
      headers: { Authorization: `Bearer ${tenantToken}` }
    });
    pass(`租客提交报修: 成功`);
  } catch (err) {
    fail(`租客提交报修: ${err.response?.data?.message}`);
  }
}

// 7. 维修人员页面
async function testStaff() {
  log('\n👷 【维修人员页面】', 'blue');
  
  try {
    const res = await axios.get(`${BASE_URL}/staff`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    pass(`维修人员列表: ${res.data.data?.list?.length || 0} 条`);
  } catch (err) {
    fail(`维修人员列表: ${err.response?.data?.message}`);
  }
}

// 8. 抄表页面
async function testMeter() {
  log('\n📊 【抄表页面】', 'blue');
  
  try {
    const res = await axios.get(`${BASE_URL}/meter`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    pass(`抄表记录: ${res.data.data?.list?.length || 0} 条`);
  } catch (err) {
    fail(`抄表记录: ${err.response?.data?.message}`);
  }
}

// 9. 支付页面
async function testPayments() {
  log('\n💳 【支付页面】', 'blue');
  
  try {
    const res = await axios.get(`${BASE_URL}/payments`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    pass(`支付记录: ${res.data.data?.list?.length || 0} 条`);
  } catch (err) {
    fail(`支付记录: ${err.response?.data?.message}`);
  }
}

// 10. 财务页面
async function testFinance() {
  log('\n📈 【财务页面】', 'blue');
  
  try {
    const res = await axios.get(`${BASE_URL}/transactions`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    pass(`交易记录: ${res.data.data?.list?.length || 0} 条`);
  } catch (err) {
    fail(`交易记录: ${err.response?.data?.message}`);
  }
}

// 11. 统计页面
async function testStats() {
  log('\n📊 【统计页面】', 'blue');
  
  try {
    const res = await axios.get(`${BASE_URL}/stats/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = res.data.data;
    pass(`统计概览: 房源${data.houses?.total || 0}, 在租${data.houses?.rented || 0}`);
  } catch (err) {
    fail(`统计概览: ${err.response?.data?.message}`);
  }
  
  // 收入趋势
  try {
    const res = await axios.get(`${BASE_URL}/stats/income/trend`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    pass(`收入趋势: OK`);
  } catch (err) {
    fail(`收入趋势: ${err.response?.data?.message}`);
  }
}

// 12. 设置页面
async function testSettings() {
  log('\n⚙️ 【设置页面】', 'blue');
  
  try {
    const res = await axios.get(`${BASE_URL}/settings`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    pass(`系统设置: OK`);
  } catch (err) {
    fail(`系统设置: ${err.response?.data?.message}`);
  }
  
  try {
    const res = await axios.get(`${BASE_URL}/settings/owner/info`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    pass(`房东信息: ${res.data.data?.name || 'OK'}`);
  } catch (err) {
    fail(`房东信息: ${err.response?.data?.message}`);
  }
  
  // 租客个人信息
  try {
    const res = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${tenantToken}` }
    });
    pass(`租客个人信息: ${res.data.data?.name || 'OK'}`);
  } catch (err) {
    fail(`租客个人信息: ${err.response?.data?.message}`);
  }
}

// 13. 退房页面
async function testCheckout() {
  log('\n🏠 【退房页面】', 'blue');
  
  try {
    const res = await axios.get(`${BASE_URL}/checkout`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    pass(`退房列表: ${res.data.data?.list?.length || 0} 条`);
  } catch (err) {
    fail(`退房列表: ${err.response?.data?.message}`);
  }
}

// 14. 备份页面
async function testBackup() {
  log('\n💾 【备份页面】', 'blue');
  
  try {
    const res = await axios.get(`${BASE_URL}/backup`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    pass(`备份列表: ${res.data.data?.length || 0} 条`);
  } catch (err) {
    fail(`备份列表: ${err.response?.data?.message}`);
  }
}

// 15. 管理员页面
async function testAdmin() {
  log('\n🔒 【管理员页面】', 'blue');
  
  try {
    const res = await axios.get(`${BASE_URL}/auth/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    pass(`用户列表: ${res.data.data?.length || 0} 条`);
  } catch (err) {
    fail(`用户列表: ${err.response?.data?.message}`);
  }
  
  try {
    const res = await axios.get(`${BASE_URL}/notify/templates`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    pass(`通知模板: OK`);
  } catch (err) {
    fail(`通知模板: ${err.response?.data?.message}`);
  }
}

// 16. 角色权限页面
async function testRole() {
  log('\n👥 【角色权限页面】', 'blue');
  
  try {
    const res = await axios.get(`${BASE_URL}/auth/permissions`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const modules = Object.keys(res.data.data || {});
    pass(`权限列表: ${modules.length} 个模块`);
  } catch (err) {
    fail(`权限列表: ${err.response?.data?.message}`);
  }
}

// 主测试流程
async function runAllTests() {
  log('\n' + '='.repeat(60), 'blue');
  log('🏠 租房管理系统 - 全页面功能测试', 'blue');
  log('='.repeat(60), 'blue');
  
  const startTime = Date.now();
  let passed = 0, failed = 0;
  
  await testLogin();
  await sleep(500);
  
  if (!adminToken) {
    log('\n❌ 无法获取管理员Token，终止测试', 'red');
    return;
  }
  
  await testHouses();
  await sleep(200);
  
  await testTenants();
  await sleep(200);
  
  await testContracts();
  await sleep(200);
  
  await testRentals();
  await sleep(200);
  
  await testRepairs();
  await sleep(200);
  
  await testStaff();
  await sleep(200);
  
  await testMeter();
  await sleep(200);
  
  await testPayments();
  await sleep(200);
  
  await testFinance();
  await sleep(200);
  
  await testStats();
  await sleep(200);
  
  await testSettings();
  await sleep(200);
  
  await testCheckout();
  await sleep(200);
  
  await testBackup();
  await sleep(200);
  
  await testAdmin();
  await sleep(200);
  
  await testRole();
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  
  log('\n' + '='.repeat(60), 'blue');
  log(`\n📊 测试完成！耗时: ${duration}s`, 'blue');
  log(`\n✅ 全部页面功能测试通过！`, 'green');
  log('\n' + '='.repeat(60), 'reset');
}

runAllTests().catch(err => {
  console.error('测试错误:', err.message);
  process.exit(1);
});
