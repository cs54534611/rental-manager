/**
 * 租房管理系统 - 全面自动化测试
 * 对应微信小程序页面功能
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};
const log = (msg, color = 'reset') => console.log(`${colors[color]}${msg}${colors.reset}`);
const pass = (msg) => log(`  ✅ ${msg}`, 'green');
const fail = (msg) => log(`  ❌ ${msg}`, 'red');
const info = (msg) => log(`  ℹ️  ${msg}`, 'cyan');

// 测试用户
const users = {
  admin: { username: 'admin', password: 'admin123', role: 'super', name: '超级管理员' },
  tenant: { username: '13900001111', password: 'admin123', role: 'tenant', name: '租客-李先生' },
  repair: { username: '13800138002', password: 'repair123', role: 'repair', name: '维修人员-李师傅' }
};

// ==================== 登录模块 (login页面) ====================
const authTests = [
  // 公开接口
  { method: 'GET', path: '/health', role: 'public', name: '健康检查', page: 'login' },
  { method: 'POST', path: '/auth/login', data: { username: 'admin', password: 'admin123' }, role: 'public', name: '管理员登录', page: 'login' },
  { method: 'POST', path: '/auth/login', data: { username: '13900001111', password: 'admin123', loginType: 'tenant' }, role: 'public', name: '租客登录', page: 'login' },
  { method: 'POST', path: '/auth/login', data: { username: '13800138002', password: 'repair123', loginType: 'tenant' }, role: 'public', name: '维修人员登录', page: 'login' },
];

// ==================== 房源模块 (houses页面) ====================
const houseTests = [
  { method: 'GET', path: '/houses', role: 'all', name: '房源列表', page: 'houses' },
  { method: 'GET', path: '/houses/1', role: 'all', name: '房源详情', page: 'houses' },
  { method: 'POST', path: '/houses', data: { community: '测试小区', address: '测试地址', layout: '2室1厅', area: 80, floor: '5/20', orientation: '南', decoration: '精装', rent: 3000, deposit: 6000 }, role: 'admin', name: '添加房源', page: 'houses' },
  { method: 'PUT', path: '/houses/1', data: { community: '更新小区', address: '更新地址', layout: '2室1厅', area: 85, floor: '6/20', orientation: '南', decoration: '精装', rent: 3200, deposit: 6400 }, role: 'admin', name: '更新房源', page: 'houses' },
];

// ==================== 租客模块 (tenants页面) ====================
const tenantTests = [
  { method: 'GET', path: '/tenants', role: 'admin', name: '租客列表', page: 'tenants' },
  { method: 'GET', path: '/tenants/1', role: 'admin', name: '租客详情', page: 'tenants' },
  { method: 'POST', path: '/tenants', data: { name: '测试租客', phone: '13900009999', id_card: '510000000000000099', gender: 1 }, role: 'admin', name: '添加租客', page: 'tenants' },
  { method: 'PUT', path: '/tenants/1', data: { name: '更新租客', phone: '13900009998', gender: 2 }, role: 'admin', name: '更新租客', page: 'tenants' },
];

// ==================== 合同模块 (contracts页面) ====================
const contractTests = [
  { method: 'GET', path: '/contracts', role: 'all', name: '合同列表', page: 'contracts' },
  { method: 'GET', path: '/contracts/1', role: 'all', name: '合同详情', page: 'contracts' },
  { method: 'POST', path: '/contracts', data: { house_id: 1, tenant_id: 1, start_date: '2024-01-01', end_date: '2025-01-01', monthly_rent: 2000, payment_method: 1, deposit: 4000 }, role: 'admin', name: '添加合同', page: 'contracts' },
  { method: 'PUT', path: '/contracts/1', data: { monthly_rent: 2200, start_date: '2024-01-01', end_date: '2025-01-01', payment_method: 1, deposit: 4000 }, role: 'admin', name: '更新合同', page: 'contracts' },
  { method: 'POST', path: '/contracts/renew/2', data: { start_date: '2025-06-01', end_date: '2026-05-31', monthly_rent: 2500 }, role: 'admin', name: '续签合同', page: 'contracts' },
];

// ==================== 租金模块 (rentals页面) ====================
const rentalTests = [
  { method: 'GET', path: '/rentals', role: 'all', name: '租金列表', page: 'rentals' },
  { method: 'POST', path: '/rentals/generate', data: { year: 2025, month: 3 }, role: 'admin', name: '生成账单', page: 'rentals' },
  { method: 'GET', path: '/rentals/stats/pending', role: 'admin', name: '待收统计', page: 'rentals' },
];

// ==================== 报修模块 (repairs页面) ====================
const repairTests = [
  { method: 'GET', path: '/repairs', role: 'all', name: '报修列表', page: 'repairs' },
  { method: 'POST', path: '/repairs', data: { house_id: 1, tenant_id: 1, title: '水龙头漏水', content: '厨房水龙头漏水', type: 1, description: '需要维修' }, role: 'all', name: '提交报修', page: 'repairs' },
  { method: 'PATCH', path: '/repairs/1/status', data: { status: 2 }, role: 'admin', name: '更新报修状态', page: 'repairs' },
];

// ==================== 维修人员模块 (staff页面) ====================
const staffTests = [
  { method: 'GET', path: '/staff', role: 'admin', name: '维修人员列表', page: 'staff' },
  { method: 'GET', path: '/staff/1', role: 'admin', name: '维修人员详情', page: 'staff' },
  { method: 'POST', path: '/staff', data: { name: '赵师傅', phone: '13800138999', specialty: '综合维修' }, role: 'admin', name: '添加维修人员', page: 'staff' },
  { method: 'PUT', path: '/staff/1', data: { name: '张师傅', phone: '13900000001', specialty: '水电维修' }, role: 'admin', name: '更新维修人员', page: 'staff' },
];

// ==================== 抄表模块 (meter页面) ====================
const meterTests = [
  { method: 'GET', path: '/meter', role: 'all', name: '抄表记录', page: 'meter' },
  { method: 'POST', path: '/meter', data: { house_id: 1, period: '2025-06', water_current: 120, electric_current: 250 }, role: 'admin', name: '添加抄表记录', page: 'meter' },
  { method: 'POST', path: '/meter/calculate', data: { house_id: 1, type: 'water', reading: 120 }, role: 'admin', name: '计算水费', page: 'meter' },
  { method: 'POST', path: '/meter/calculate', data: { house_id: 1, type: 'electric', reading: 300 }, role: 'admin', name: '计算电费', page: 'meter' },
];

// ==================== 支付模块 (payments页面) ====================
const paymentTests = [
  { method: 'GET', path: '/payments/channels', role: 'admin', name: '支付渠道', page: 'payments' },
  { method: 'GET', path: '/payments/list', role: 'admin', name: '支付记录', page: 'payments' },
  { method: 'GET', path: '/payments/stats', role: 'admin', name: '支付统计', page: 'payments' },
];

// ==================== 财务模块 (finance页面) ====================
const financeTests = [
  { method: 'GET', path: '/transactions', role: 'admin', name: '交易记录', page: 'finance' },
  { method: 'POST', path: '/transactions', data: { type: 'income', category: '租金', amount: 2000, house_id: 1, tenant_id: 1, remark: '测试交易' }, role: 'admin', name: '添加交易', page: 'finance' },
];

// ==================== 统计模块 (stats页面) ====================
const statsTests = [
  { method: 'GET', path: '/stats/overview', role: 'all', name: '统计概览', page: 'stats' },
  { method: 'GET', path: '/stats/income', role: 'admin', name: '收入趋势', page: 'stats' },
  { method: 'GET', path: '/stats/houses/distribution', role: 'admin', name: '房源分布', page: 'stats' },
  { method: 'GET', path: '/stats/occupancy', role: 'admin', name: '入住率', page: 'stats' },
  { method: 'GET', path: '/stats/revenue?year=2024', role: 'admin', name: '年度营收', page: 'stats' },
];

// ==================== 设置模块 (settings页面) ====================
const settingsTests = [
  { method: 'GET', path: '/settings', role: 'admin', name: '系统设置', page: 'settings' },
  { method: 'GET', path: '/settings/owner/info', role: 'all', name: '房东信息', page: 'settings' },
  { method: 'PUT', path: '/settings', data: { site_name: '租房管理系统V2' }, role: 'admin', name: '更新设置', page: 'settings' },
];

// ==================== 退房模块 (checkout页面) ====================
const checkoutTests = [
  { method: 'GET', path: '/checkout', role: 'admin', name: '退房列表', page: 'checkout' },
  { method: 'POST', path: '/checkout', data: { contract_id: 8, checkout_date: '2025-03-20', remark: '测试退房' }, role: 'admin', name: '发起退房', page: 'checkout' },
];

// ==================== 备份模块 (backup页面) ====================
const backupTests = [
  { method: 'GET', path: '/backup', role: 'admin', name: '备份列表', page: 'backup' },
  { method: 'POST', path: '/backup', data: {}, role: 'admin', name: '手动备份', page: 'backup' },
];

// ==================== 通知模块 ====================
const notifyTests = [
  { method: 'GET', path: '/notify/templates', role: 'admin', name: '通知模板', page: 'admin' },
];

// ==================== 合同模板模块 ====================
const contractTemplateTests = [
  { method: 'GET', path: '/contract-templates', role: 'admin', name: '合同模板列表', page: 'contracts' },
  { method: 'POST', path: '/contract-templates', data: { name: '标准租赁合同', content: '合同内容...' }, role: 'admin', name: '添加合同模板', page: 'contracts' },
];

// ==================== 用户权限模块 (role页面) ====================
const roleTests = [
  { method: 'GET', path: '/auth/users', role: 'admin', name: '用户列表', page: 'role' },
  { method: 'GET', path: '/auth/permissions', role: 'admin', name: '权限列表', page: 'role' },
  { method: 'POST', path: '/auth/users', data: { username: 'testuser', password: 'test123', role: 'admin', name: '测试用户', phone: '13800000001' }, role: 'admin', name: '添加用户', page: 'role' },
  { method: 'PUT', path: '/auth/users/2', data: { role: 'admin', name: '更新用户', phone: '13800000002', status: 1 }, role: 'admin', name: '更新用户', page: 'role' },
];

// 合并所有测试
const allTests = [
  { name: '【登录模块】(login页面)', tests: authTests },
  { name: '【房源模块】(houses页面)', tests: houseTests },
  { name: '【租客模块】(tenants页面)', tests: tenantTests },
  { name: '【合同模块】(contracts页面)', tests: contractTests },
  { name: '【租金模块】(rentals页面)', tests: rentalTests },
  { name: '【报修模块】(repairs页面)', tests: repairTests },
  { name: '【维修人员模块】(staff页面)', tests: staffTests },
  { name: '【抄表模块】(meter页面)', tests: meterTests },
  { name: '【支付模块】(payments页面)', tests: paymentTests },
  { name: '【财务模块】(finance页面)', tests: financeTests },
  { name: '【统计模块】(stats页面)', tests: statsTests },
  { name: '【设置模块】(settings页面)', tests: settingsTests },
  { name: '【退房模块】(checkout页面)', tests: checkoutTests },
  { name: '【备份模块】(backup页面)', tests: backupTests },
  { name: '【通知模块】', tests: notifyTests },
  { name: '【合同模板模块】', tests: contractTemplateTests },
  { name: '【权限角色模块】(role页面)', tests: roleTests },
];

// 登录获取token
async function login(username, password, loginType = null) {
  try {
    const data = loginType ? { username, password, loginType } : { username, password };
    const res = await axios.post(`${BASE_URL}/auth/login`, data);
    return res.data.data?.token;
  } catch (err) {
    return null;
  }
}

// 测试单个接口
async function testEndpoint(token, method, path, data = null) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    let res;
    if (method === 'GET') res = await axios.get(`${BASE_URL}${path}`, { headers });
    else if (method === 'POST') res = await axios.post(`${BASE_URL}${path}`, data, { headers });
    else if (method === 'PUT') res = await axios.put(`${BASE_URL}${path}`, data, { headers });
    else if (method === 'PATCH') res = await axios.patch(`${BASE_URL}${path}`, data, { headers });
    else if (method === 'DELETE') res = await axios.delete(`${BASE_URL}${path}`, { headers });
    return { ok: res.data.code === 0, status: res.status, data: res.data };
  } catch (err) {
    return { ok: false, status: err.response?.status || 0, error: err.response?.data?.message || err.message };
  }
}

// 运行测试
async function runTests() {
  log('\n🏠 租房管理系统 - 全面自动化测试', 'blue');
  log('=' .repeat(70), 'blue');
  log('\n📋 获取Token...\n', 'yellow');

  const tokens = {};
  for (const [key, user] of Object.entries(users)) {
    tokens[key] = await login(user.username, user.password, user.role === 'tenant' || user.role === 'repair' ? 'tenant' : null);
    const status = tokens[key] ? '✅' : '❌';
    log(`  ${status} ${user.name} (${user.role}): ${tokens[key] ? '登录成功' : '登录失败'}`, tokens[key] ? 'green' : 'red');
  }

  log('\n' + '='.repeat(70), 'blue');
  log('\n🚀 开始测试...\n', 'yellow');

  const results = { admin: { pass: 0, fail: 0 }, tenant: { pass: 0, fail: 0 }, repair: { pass: 0, fail: 0 }, public: { pass: 0, fail: 0 } };
  const failed = [];

  for (const group of allTests) {
    log(`\n${group.name}`, 'cyan');
    log('-'.repeat(50), 'blue');

    for (const test of group.tests) {
      let result;
      let token = null;

      if (test.role === 'public') {
        result = await testEndpoint(null, test.method, test.path, test.data);
        result.ok ? results.public.pass++ : results.public.fail++;
      } else if (test.role === 'admin' || test.role === 'all') {
        token = tokens.admin;
        result = await testEndpoint(token, test.method, test.path, test.data);
        result.ok ? results.admin.pass++ : results.admin.fail++;
      } else if (test.role === 'tenant') {
        token = tokens.tenant;
        result = await testEndpoint(token, test.method, test.path, test.data);
        result.ok ? results.tenant.pass++ : results.tenant.fail++;
      } else if (test.role === 'repair') {
        token = tokens.repair;
        result = await testEndpoint(token, test.method, test.path, test.data);
        result.ok ? results.repair.pass++ : results.repair.fail++;
      }

      if (result.ok) {
        pass(`${test.name} (${test.page})`);
      } else {
        fail(`${test.name} (${test.page}): ${result.error || '失败'}`);
        failed.push({ ...test, error: result.error });
      }
    }
  }

  // 输出汇总
  log('\n' + '='.repeat(70), 'blue');
  log('\n📊 测试结果汇总', 'blue');
  log('-'.repeat(50), 'blue');

  log(`\n  👤 超级管理员 (admin):`, 'yellow');
  log(`     ✅ 通过: ${results.admin.pass} | ❌ 失败: ${results.admin.fail}`, results.admin.fail === 0 ? 'green' : 'red');

  log(`\n  👥 租客 (tenant):`, 'yellow');
  log(`     ✅ 通过: ${results.tenant.pass} | ❌ 失败: ${results.tenant.fail}`, results.tenant.fail === 0 ? 'green' : 'red');

  log(`\n  🔧 维修人员 (repair):`, 'yellow');
  log(`     ✅ 通过: ${results.repair.pass} | ❌ 失败: ${results.repair.fail}`, results.repair.fail === 0 ? 'green' : 'red');

  log(`\n  🌐 公开接口 (public):`, 'yellow');
  log(`     ✅ 通过: ${results.public.pass} | ❌ 失败: ${results.public.fail}`, results.public.fail === 0 ? 'green' : 'red');

  const total = results.admin.pass + results.tenant.pass + results.repair.pass + results.public.pass;
  const totalFail = results.admin.fail + results.tenant.fail + results.repair.fail + results.public.fail;

  log(`\n  📈 总计:`, 'yellow');
  log(`     ✅ 通过: ${total} | ❌ 失败: ${totalFail}`, totalFail === 0 ? 'green' : 'red');

  if (failed.length > 0) {
    log('\n❌ 失败详情:', 'red');
    failed.forEach((t, i) => log(`  ${i + 1}. ${t.name} (${t.page}): ${t.error}`, 'red'));
  }

  log('\n✅ 测试完成!\n', 'green');
}

runTests().catch(err => log(`\n❌ 错误: ${err.message}\n`, 'red'));
