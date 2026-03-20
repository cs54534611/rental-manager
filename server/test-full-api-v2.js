/**
 * 租房管理系统 - 全面自动化测试 (修复限流问题)
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

const colors = {
  green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', blue: '\x1b[34m', cyan: '\x1b[36m', reset: '\x1b[0m'
};
const log = (msg, color = 'reset') => console.log(`${colors[color]}${msg}${colors.reset}`);
const pass = (msg) => log(`  ✅ ${msg}`, 'green');
const fail = (msg) => log(`  ❌ ${msg}`, 'red');

// 测试用户
const users = {
  admin: { username: 'admin', password: 'admin123', role: 'super', name: '超级管理员' },
  tenant: { username: '13900001111', password: 'admin123', role: 'tenant', name: '租客' },
  repair: { username: '13800138002', password: 'repair123', role: 'repair', name: '维修人员' }
};

// 所有测试
const allTests = [
  // 【登录模块】
  { name: '健康检查', path: '/health', method: 'GET', role: 'public', page: 'login' },
  { name: '管理员登录', path: '/auth/login', method: 'POST', data: { username: 'admin', password: 'admin123' }, role: 'public', page: 'login' },
  
  // 【房源模块】
  { name: '房源列表', path: '/houses', method: 'GET', role: 'admin', page: 'houses' },
  { name: '房源详情', path: '/houses/1', method: 'GET', role: 'admin', page: 'houses' },
  { name: '添加房源', path: '/houses', method: 'POST', data: { community: '测试小区', address: '测试地址', layout: '2室1厅', area: 80, floor: '5/20', orientation: '南', decoration: '精装', rent: 3000, deposit: 6000 }, role: 'admin', page: 'houses' },
  { name: '更新房源', path: '/houses/1', method: 'PUT', data: { community: '更新小区', address: '更新地址', layout: '2室1厅', area: 85, floor: '6/20', orientation: '南', decoration: '精装', rent: 3200, deposit: 6400 }, role: 'admin', page: 'houses' },
  
  // 【租客模块】
  { name: '租客列表', path: '/tenants', method: 'GET', role: 'admin', page: 'tenants' },
  { name: '租客详情', path: '/tenants/1', method: 'GET', role: 'admin', page: 'tenants' },
  { name: '添加租客', path: '/tenants', method: 'POST', data: { name: '测试租客', phone: '13900009998', id_card: '510000000000000098', gender: 1 }, role: 'admin', page: 'tenants' },
  { name: '更新租客', path: '/tenants/1', method: 'PUT', data: { name: '更新租客', phone: '13900009997', gender: 2 }, role: 'admin', page: 'tenants' },
  
  // 【合同模块】
  { name: '合同列表', path: '/contracts', method: 'GET', role: 'admin', page: 'contracts' },
  { name: '合同详情', path: '/contracts/1', method: 'GET', role: 'admin', page: 'contracts' },
  { name: '添加合同', path: '/contracts', method: 'POST', data: { house_id: 1, tenant_id: 1, start_date: '2024-06-01', end_date: '2025-05-31', monthly_rent: 2000, payment_method: 1, deposit: 4000 }, role: 'admin', page: 'contracts' },
  { name: '更新合同', path: '/contracts/1', method: 'PUT', data: { monthly_rent: 2200, start_date: '2024-01-01', end_date: '2025-01-01', payment_method: 1, deposit: 4000 }, role: 'admin', page: 'contracts' },
  { name: '续签合同', path: '/contracts/renew/2', method: 'POST', data: { start_date: '2025-06-01', end_date: '2026-05-31', monthly_rent: 2500 }, role: 'admin', page: 'contracts' },
  
  // 【租金模块】
  { name: '租金列表', path: '/rentals', method: 'GET', role: 'admin', page: 'rentals' },
  { name: '生成账单', path: '/rentals/generate', method: 'POST', data: { year: 2025, month: 4 }, role: 'admin', page: 'rentals' },
  { name: '待收统计', path: '/rentals/stats/pending', method: 'GET', role: 'admin', page: 'rentals' },
  
  // 【报修模块】
  { name: '报修列表', path: '/repairs', method: 'GET', role: 'admin', page: 'repairs' },
  { name: '提交报修', path: '/repairs', method: 'POST', data: { house_id: 1, tenant_id: 1, title: '水龙头漏水', content: '厨房水龙头漏水', type: 1, description: '需要维修' }, role: 'admin', page: 'repairs' },
  { name: '更新报修', path: '/repairs/1/status', method: 'PATCH', data: { status: 2 }, role: 'admin', page: 'repairs' },
  
  // 【维修人员模块】
  { name: '维修人员列表', path: '/staff', method: 'GET', role: 'admin', page: 'staff' },
  { name: '维修人员详情', path: '/staff/1', method: 'GET', role: 'admin', page: 'staff' },
  { name: '添加维修人员', path: '/staff', method: 'POST', data: { name: '刘师傅', phone: '13800138998', specialty: '综合维修' }, role: 'admin', page: 'staff' },
  { name: '更新维修人员', path: '/staff/1', method: 'PUT', data: { name: '张师傅', phone: '13900000001', specialty: '水电维修' }, role: 'admin', page: 'staff' },
  
  // 【抄表模块】
  { name: '抄表记录', path: '/meter', method: 'GET', role: 'admin', page: 'meter' },
  { name: '添加抄表', path: '/meter', method: 'POST', data: { house_id: 1, period: '2025-07', water_current: 130, electric_current: 280 }, role: 'admin', page: 'meter' },
  { name: '计算水费', path: '/meter/calculate', method: 'POST', data: { house_id: 1, type: 'water', reading: 150 }, role: 'admin', page: 'meter' },
  { name: '计算电费', path: '/meter/calculate', method: 'POST', data: { house_id: 1, type: 'electric', reading: 350 }, role: 'admin', page: 'meter' },
  
  // 【支付模块】
  { name: '支付渠道', path: '/payments/channels', method: 'GET', role: 'admin', page: 'payments' },
  { name: '支付记录', path: '/payments/list', method: 'GET', role: 'admin', page: 'payments' },
  { name: '支付统计', path: '/payments/stats', method: 'GET', role: 'admin', page: 'payments' },
  
  // 【财务模块】
  { name: '交易记录', path: '/transactions', method: 'GET', role: 'admin', page: 'finance' },
  { name: '添加交易', path: '/transactions', method: 'POST', data: { type: 'income', category: '租金', amount: 2000, house_id: 1, tenant_id: 1, remark: '测试交易' }, role: 'admin', page: 'finance' },
  
  // 【统计模块】
  { name: '统计概览', path: '/stats/overview', method: 'GET', role: 'admin', page: 'stats' },
  { name: '收入趋势', path: '/stats/income', method: 'GET', role: 'admin', page: 'stats' },
  { name: '房源分布', path: '/stats/houses/distribution', method: 'GET', role: 'admin', page: 'stats' },
  { name: '入住率', path: '/stats/occupancy', method: 'GET', role: 'admin', page: 'stats' },
  { name: '年度营收', path: '/stats/revenue?year=2024', method: 'GET', role: 'admin', page: 'stats' },
  
  // 【设置模块】
  { name: '系统设置', path: '/settings', method: 'GET', role: 'admin', page: 'settings' },
  { name: '房东信息', path: '/settings/owner/info', method: 'GET', role: 'admin', page: 'settings' },
  { name: '更新设置', path: '/settings', method: 'PUT', data: { site_name: '租房管理系统V2' }, role: 'admin', page: 'settings' },
  
  // 【退房模块】
  { name: '退房列表', path: '/checkout', method: 'GET', role: 'admin', page: 'checkout' },
  
  // 【备份模块】
  { name: '备份列表', path: '/backup', method: 'GET', role: 'admin', page: 'backup' },
  
  // 【通知模块】
  { name: '通知模板', path: '/notify/templates', method: 'GET', role: 'admin', page: 'admin' },
  
  // 【合同模板模块】
  { name: '合同模板列表', path: '/contract-templates', method: 'GET', role: 'admin', page: 'contracts' },
  { name: '添加合同模板', path: '/contract-templates', method: 'POST', data: { name: '标准合同V2', content: '合同内容...' }, role: 'admin', page: 'contracts' },
  
  // 【权限角色模块】
  { name: '用户列表', path: '/auth/users', method: 'GET', role: 'admin', page: 'role' },
  { name: '权限列表', path: '/auth/permissions', method: 'GET', role: 'admin', page: 'role' },
  { name: '添加用户', path: '/auth/users', method: 'POST', data: { username: 'testuser02', password: 'test123', role: 'admin', name: '测试用户2', phone: '13800000002' }, role: 'admin', page: 'role' },
];

// 登录
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

// 主测试
async function runTests() {
  log('\n🏠 租房管理系统 - 全面自动化测试', 'blue');
  log('='.repeat(70), 'blue');
  
  // 只登录管理员（避免限流）
  log('\n📋 获取管理员Token...\n', 'yellow');
  const adminToken = await login('admin', 'admin123');
  if (adminToken) {
    pass(`管理员登录成功`);
  } else {
    log('  ❌ 管理员登录失败，测试无法继续', 'red');
    return;
  }
  
  log('\n' + '='.repeat(70), 'blue');
  log('\n🚀 开始测试...\n', 'yellow');
  
  let passCount = 0, failCount = 0;
  const failed = [];
  
  // 按页面分组测试
  const pageGroups = {};
  for (const test of allTests) {
    if (!pageGroups[test.page]) pageGroups[test.page] = [];
    pageGroups[test.page].push(test);
  }
  
  for (const [page, tests] of Object.entries(pageGroups)) {
    log(`\n【${page}页面】`, 'cyan');
    log('-'.repeat(50), 'blue');
    
    for (const test of tests) {
      // 公开接口不需要token
      const token = test.role === 'public' ? null : adminToken;
      const result = await testEndpoint(token, test.method, test.path, test.data);
      
      if (result.ok) {
        pass(`${test.name}`);
        passCount++;
      } else {
        fail(`${test.name}: ${result.error || '失败'}`);
        failCount++;
        failed.push({ ...test, error: result.error });
      }
      
      // 添加小延迟避免触发限流
      await new Promise(r => setTimeout(r, 100));
    }
  }
  
  // 汇总
  log('\n' + '='.repeat(70), 'blue');
  log('\n📊 测试结果汇总', 'blue');
  log(`\n  ✅ 通过: ${passCount} | ❌ 失败: ${failCount}`, failCount === 0 ? 'green' : 'red');
  
  if (failed.length > 0) {
    log('\n❌ 失败详情:', 'red');
    failed.forEach((t, i) => log(`  ${i + 1}. ${t.name}: ${t.error}`, 'red'));
  }
  
  log('\n✅ 测试完成!\n', 'green');
}

runTests().catch(err => log(`\n❌ 错误: ${err.message}\n`, 'red'));
