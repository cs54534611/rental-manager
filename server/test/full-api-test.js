/**
 * 全量API测试脚本 - 最终版
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

const users = {
  admin: { username: 'admin', password: 'admin123', role: 'super', name: '超级管理员' },
  tenant: { username: '13900001111', password: 'admin123', role: 'tenant', name: '租客' }
};

const colors = { red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', blue: '\x1b[34m', reset: '\x1b[0m' };
const log = (msg, color = 'reset') => console.log(`${colors[color]}${msg}${colors.reset}`);

async function login(username, password) {
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, { username, password });
    return res.data.data?.token;
  } catch (err) { return null; }
}

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

const testCases = [
  // 公开
  { method: 'GET', path: '/', role: 'public', name: '健康检查' },
  { method: 'POST', path: '/auth/login', data: { username: 'admin', password: 'admin123' }, role: 'public', name: '管理员登录' },
  { method: 'POST', path: '/auth/login', data: { username: '13900001111', password: 'admin123', loginType: 'tenant' }, role: 'public', name: '租客登录' },
  { method: 'GET', path: '/auth/permissions', role: 'admin', name: '获取权限' },
  { method: 'GET', path: '/auth/users', role: 'admin', name: '用户列表' },
  
  // 房源
  { method: 'GET', path: '/houses', role: 'all', name: '房源列表' },
  { method: 'GET', path: '/houses/1', role: 'all', name: '房源详情' },
  { method: 'POST', path: '/houses', data: { community: '测试', address: '测试', layout: '1室', area: 50, floor: '1/10', orientation: '南', decoration: '简', rent: 1000, deposit: 2000 }, role: 'admin', name: '添加房源' },
  
  // 租客
  { method: 'GET', path: '/tenants', role: 'admin', name: '租客列表' },
  { method: 'POST', path: '/tenants', data: { name: '测试租客', phone: '13900009999', idcard: '510000000000000001', gender: 1 }, role: 'admin', name: '添加租客' },
  
  // 合同
  { method: 'GET', path: '/contracts', role: 'all', name: '合同列表' },
  { method: 'GET', path: '/contracts/1', role: 'all', name: '合同详情' },
  { method: 'POST', path: '/contracts', data: { house_id: 1, tenant_id: 1, start_date: '2024-01-01', end_date: '2025-01-01', monthly_rent: 2000, payment_method: 1, deposit: 4000 }, role: 'admin', name: '添加合同' },
  { method: 'PUT', path: '/contracts/1', data: { monthly_rent: 2200, start_date: '2024-01-01', end_date: '2025-01-01' }, role: 'admin', name: '更新合同' },
  { method: 'POST', path: '/contracts/renew/1', data: { start_date: '2025-01-02', end_date: '2026-01-01', monthly_rent: 2200 }, role: 'admin', name: '续签合同' },
  
  // 租金
  { method: 'GET', path: '/rentals', role: 'all', name: '租金列表' },
  { method: 'POST', path: '/rentals/generate', data: { year: 2025, month: 3 }, role: 'admin', name: '生成账单' },
  { method: 'GET', path: '/rentals/stats/pending', role: 'admin', name: '待收统计' },
  
  // 报修
  { method: 'GET', path: '/repairs', role: 'all', name: '报修列表' },
  { method: 'POST', path: '/repairs', data: { house_id: 1, tenant_id: 1, title: '测试报修', content: '内容', type: 1, description: '描述' }, role: 'all', name: '提交报修' },
  { method: 'PATCH', path: '/repairs/1/status', data: { status: 2 }, role: 'admin', name: '更新报修' },
  
  // 维修人员
  { method: 'GET', path: '/staff', role: 'admin', name: '维修人员列表' },
  { method: 'POST', path: '/staff', data: { name: '张师傅', phone: '13800138001', specialty: '水电' }, role: 'admin', name: '添加维修' },
  { method: 'PUT', path: '/staff/1', data: { name: '张师傅', phone: '13900000001' }, role: 'admin', name: '更新维修' },
  
  // 统计
  { method: 'GET', path: '/stats/overview', role: 'all', name: '统计概览' },
  { method: 'GET', path: '/stats/income', role: 'admin', name: '收入趋势' },
  { method: 'GET', path: '/stats/houses/distribution', role: 'admin', name: '房源分布' },
  { method: 'GET', path: '/stats/occupancy', role: 'admin', name: '入住率' },
  { method: 'GET', path: '/stats/revenue?year=2024', role: 'admin', name: '营收统计' },
  
  // 设置
  { method: 'GET', path: '/settings', role: 'admin', name: '系统设置' },
  { method: 'GET', path: '/settings/owner/info', role: 'all', name: '房东信息' },
  { method: 'PUT', path: '/settings', data: { site_name: '租房系统' }, role: 'admin', name: '更新设置' },
  
  // 交易
  { method: 'GET', path: '/transactions', role: 'admin', name: '交易记录' },
  { method: 'POST', path: '/transactions', data: { type: 'income', category: '租金', amount: 2000, house_id: 1, tenant_id: 1 }, role: 'admin', name: '添加交易' },
  
  // 抄表
  { method: 'GET', path: '/meter', role: 'all', name: '抄表记录' },
  { method: 'POST', path: '/meter', data: { house_id: 1, period: '2025-03', water_current: 100, electric_current: 200 }, role: 'admin', name: '添加抄表' },
  { method: 'POST', path: '/meter/calculate', data: { house_id: 1, type: 'water', reading: 120 }, role: 'admin', name: '计算费用' },
  
  // 支付
  { method: 'GET', path: '/payments/channels', role: 'admin', name: '支付渠道' },
  { method: 'GET', path: '/payments/list', role: 'admin', name: '支付记录' },
  { method: 'GET', path: '/payments/stats', role: 'admin', name: '支付统计' },
  
  // 备份
  { method: 'GET', path: '/backup', role: 'admin', name: '备份列表' },
  { method: 'POST', path: '/backup', data: {}, role: 'admin', name: '手动备份' },
  
  // 通知
  { method: 'GET', path: '/notify/templates', role: 'admin', name: '通知模板' },
  
  // 合同模板
  { method: 'GET', path: '/contract-templates', role: 'admin', name: '合同模板' },
  { method: 'POST', path: '/contract-templates', data: { name: '测试模板', content: '内容' }, role: 'admin', name: '添加模板' },
  
  // 退房
  { method: 'GET', path: '/checkout', role: 'admin', name: '退房列表' },
];

async function runTests() {
  log('\n🏠 租房管理系统 - 全量API测试\n', 'blue');
  log('='.repeat(50), 'blue');
  
  log('\n📋 获取Token...\n', 'yellow');
  const tokens = {};
  for (const [key, user] of Object.entries(users)) {
    const token = await login(user.username, user.password);
    tokens[key] = token;
    log(`  ${user.name}: ${token ? '✅' : '❌'}`, token ? 'green' : 'red');
  }
  
  log('\n' + '='.repeat(50), 'blue');
  log('\n📊 开始测试...\n', 'yellow');
  
  let results = { public: { pass: 0, fail: 0 }, admin: { pass: 0, fail: 0 }, tenant: { pass: 0, fail: 0 } };
  let failed = [];
  
  for (const test of testCases) {
    if (test.role === 'public') {
      const r = await testEndpoint(null, test.method, test.path, test.data);
      r.ok ? results.public.pass++ : results.public.fail++;
      log(`  ${test.name}: ${r.ok ? '✅' : '❌'} (${r.status})`, r.ok ? 'green' : 'red');
      if (!r.ok) failed.push({ ...test, error: r.error });
    } 
    else if (test.role === 'admin' || test.role === 'all') {
      const r = await testEndpoint(tokens.admin, test.method, test.path, test.data);
      r.ok ? results.admin.pass++ : results.admin.fail++;
      log(`  [管] ${test.name}: ${r.ok ? '✅' : '❌'} (${r.status})`, r.ok ? 'green' : 'red');
      if (!r.ok) failed.push({ ...test, role: 'admin', error: r.error });
      
      if (test.role === 'all' && tokens.tenant) {
        const r2 = await testEndpoint(tokens.tenant, test.method, test.path, test.data);
        r2.ok ? results.tenant.pass++ : results.tenant.fail++;
        log(`  [客] ${test.name}: ${r2.ok ? '✅' : '❌'} (${r2.status})`, r2.ok ? 'green' : 'red');
        if (!r2.ok) failed.push({ ...test, role: 'tenant', error: r2.error });
      }
    }
    else if (test.role === 'tenant') {
      const r = await testEndpoint(tokens.tenant, test.method, test.path, test.data);
      r.ok ? results.tenant.pass++ : results.tenant.fail++;
      log(`  [客] ${test.name}: ${r.ok ? '✅' : '❌'} (${r.status})`, r.ok ? 'green' : 'red');
      if (!r.ok) failed.push({ ...test, error: r.error });
    }
  }
  
  log('\n' + '='.repeat(50), 'blue');
  log('\n📈 汇总\n', 'blue');
  log(`  公开: ✅ ${results.public.pass} | ❌ ${results.public.fail}`, 'yellow');
  log(`  管理员: ✅ ${results.admin.pass} | ❌ ${results.admin.fail}`, 'yellow');
  log(`  租客: ✅ ${results.tenant.pass} | ❌ ${results.tenant.fail}`, 'yellow');
  
  const total = results.public.pass + results.admin.pass + results.tenant.pass;
  const totalFail = results.public.fail + results.admin.fail + results.tenant.fail;
  log(`\n  总计: ✅ ${total} | ❌ ${totalFail}`, totalFail === 0 ? 'green' : 'red');
  
  if (failed.length > 0) {
    log('\n❌ 失败:\n', 'red');
    failed.forEach((t, i) => log(`  ${i+1}. ${t.name}: ${t.error}`, 'red'));
  }
  
  log('\n✅ 完成!\n', 'green');
}

runTests().catch(err => log(`\n❌ 错误: ${err.message}\n`, 'red'));
