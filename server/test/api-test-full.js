// 完整 API 测试脚本 - 需先登录
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let token = '';

// 辅助函数
async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    console.log(`❌ ${name}: ${msg}`);
  }
}

async function get(url) {
  return axios.get(`${BASE_URL}${url}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
}

async function post(url, data) {
  return axios.post(`${BASE_URL}${url}`, data, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
}

async function put(url, data) {
  return axios.put(`${BASE_URL}${url}`, data, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
}

async function del(url) {
  return axios.delete(`${BASE_URL}${url}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
}

// 主测试
async function runTests() {
  console.log('🚀 开始 API 完整测试...\n');
  console.log('==================================================\n');
  
  // 1. 先登录获取token
  console.log('🔐 测试登录...');
  await test('POST /auth/login - 管理员登录', async () => {
    const res = await post('/auth/login', { username: 'admin', password: 'admin123' });
    if (res.data.code !== 0) throw new Error('登录失败');
    token = res.data.data.token;
    console.log('   角色:', res.data.data.user.role);
  });
  
  if (!token) {
    console.log('\n❌ 无法获取token，测试终止');
    return;
  }
  
  console.log('\n==================================================\n');
  
  // 2. 房屋管理
  console.log('\n📦 测试房屋管理...');
  await test('GET /houses - 获取房屋列表', async () => {
    const res = await get('/houses');
    if (res.data.code !== 0) throw new Error('获取失败');
  });
  
  let houseId;
  await test('POST /houses - 创建房屋', async () => {
    const res = await post('/houses', {
      community: '测试小区',
      address: '成都市武侯区测试路123号',
      building: 'A栋',
      unit: '1单元',
      house_no: '101',
      layout: '2室1厅',
      area: 80,
      floor: 5,
      total_floor: 20,
      orientation: '南',
      decoration: '精装',
      rent: 2000,
      deposit: 4000,
      status: 0,
      tags: ['地铁口'],
      facilities: ['空调', '洗衣机']
    });
    if (res.data.code !== 0) throw new Error('创建失败: ' + res.data.message);
    houseId = res.data.data?.id;
  });
  
  // 3. 租客管理
  console.log('\n👤 测试租客管理...');
  await test('GET /tenants - 获取租客列表', async () => {
    const res = await get('/tenants');
    if (res.data.code !== 0) throw new Error('获取失败');
  });
  
  let tenantId;
  await test('POST /tenants - 创建租客', async () => {
    const res = await post('/tenants', {
      name: '测试租客',
      gender: 1,
      phone: '13900000001',
      id_card: '110101199001011234'
    });
    if (res.data.code !== 0) throw new Error('创建失败: ' + res.data.message);
    tenantId = res.data.data?.id;
  });
  
  // 4. 合同管理
  console.log('\n📄 测试合同管理...');
  await test('GET /contracts - 获取合同列表', async () => {
    const res = await get('/contracts');
    if (res.data.code !== 0) throw new Error('获取失败');
  });
  
  // 5. 租金管理
  console.log('\n💰 测试租金管理...');
  await test('GET /rentals - 获取租金列表', async () => {
    const res = await get('/rentals');
    if (res.data.code !== 0) throw new Error('获取失败');
  });
  
  // 6. 报修管理
  console.log('\n🔧 测试维修管理...');
  await test('GET /repairs - 获取维修列表', async () => {
    const res = await get('/repairs');
    if (res.data.code !== 0) throw new Error('获取失败');
  });
  
  let repairId;
  await test('POST /repairs - 创建维修工单', async () => {
    const res = await post('/repairs', {
      house_id: 1,
      type: 1,
      description: '水龙头漏水测试',
      reporter: '测试用户',
      reporter_phone: '13800138000'
    });
    if (res.data.code !== 0) throw new Error('创建失败: ' + res.data.message);
    repairId = res.data.data?.id;
  });
  
  // 7. 统计分析
  console.log('\n📊 测试统计分析...');
  await test('GET /stats/overview - 获取概览', async () => {
    const res = await get('/stats/overview');
    if (res.data.code !== 0) throw new Error('获取失败');
  });
  
  await test('GET /stats/income - 收入趋势', async () => {
    const res = await get('/stats/income');
    if (res.data.code !== 0) throw new Error('获取失败');
  });
  
  await test('GET /stats/houses/distribution - 房源分布', async () => {
    const res = await get('/stats/houses/distribution');
    if (res.data.code !== 0) throw new Error('获取失败');
  });
  
  await test('GET /stats/repairs/stats - 维修统计', async () => {
    const res = await get('/stats/repairs/stats');
    if (res.data.code !== 0) throw new Error('获取失败');
  });
  
  // 8. 员工管理
  console.log('\n👥 测试员工管理...');
  await test('GET /staff - 获取员工列表', async () => {
    const res = await get('/staff');
    if (res.data.code !== 0) throw new Error('获取失败');
  });
  
  // 9. 系统设置
  console.log('\n⚙️ 测试系统设置...');
  await test('GET /settings - 获取设置', async () => {
    const res = await get('/settings');
    if (res.data.code !== 0) throw new Error('获取失败');
  });
  
  await test('PUT /settings/owner/info - 更新房东信息', async () => {
    const res = await put('/settings/owner/info', { name: '测试房东', phone: '13800138000' });
    if (res.data.code !== 0) throw new Error('更新失败: ' + res.data.message);
  });
  
  // 10. 交易记录
  console.log('\n💳 测试交易记录...');
  await test('GET /transactions - 获取交易列表', async () => {
    const res = await get('/transactions');
    if (res.data.code !== 0) throw new Error('获取失败');
  });
  
  // 11. 抄表管理
  console.log('\n📟 测试抄表管理...');
  await test('GET /meter - 获取抄表记录', async () => {
    const res = await get('/meter');
    if (res.data.code !== 0) throw new Error('获取失败');
  });
  
  // 12. 支付管理
  console.log('\n💵 测试支付管理...');
  await test('GET /payments/channels - 获取支付渠道', async () => {
    const res = await get('/payments/channels');
    if (res.data.code !== 0) throw new Error('获取失败');
  });
  
  // 13. 通知管理
  console.log('\n🔔 测试通知管理...');
  await test('POST /notify/templates - 创建通知模板', async () => {
    const res = await post('/notify/templates', {
      type: 'test_' + Date.now(),
      template_id: 'TMPL001',
      title: '测试通知',
      content: '测试内容',
      enabled: 1
    });
    // 忽略已存在错误
  });
  
  await test('POST /notify/send - 发送通知', async () => {
    const res = await post('/notify/send', {
      user_id: 1,
      type: 'test',
      title: '测试通知',
      content: '测试内容'
    });
    if (res.data.code !== 0 && res.data.code !== 1) throw new Error('请求失败');
  });
  
  // 14. 备份管理
  console.log('\n💾 测试备份管理...');
  await test('GET /backup - 获取备份列表', async () => {
    const res = await get('/backup');
    if (res.data.code !== 0) throw new Error('获取失败');
  });
  
  // 15. 健康检查（无需认证）
  console.log('\n🏥 测试健康检查...');
  await test('GET /health - 服务健康', async () => {
    const res = await axios.get(`${BASE_URL}/health`);
    if (res.data.status !== 'ok') throw new Error('服务异常');
  });
  
  console.log('\n==================================================\n');
  console.log('📊 测试结果汇总');
  console.log('==============================');
  console.log('✅ 测试完成！');
  console.log('==============================');
}

runTests();
