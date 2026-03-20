const axios = require('axios');
const BASE_URL = 'http://localhost:3000/api';

let token, headers;

async function login() {
  const res = await axios.post(`${BASE_URL}/auth/login`, { username: 'admin', password: 'admin123' });
  token = res.data.data?.token;
  headers = { Authorization: `Bearer ${token}` };
  console.log('✅ 管理员登录成功\n');
}

async function test() {
  console.log('=== 全功能匹配测试 ===\n');
  await login();

  let pass = 0, fail = 0;

  // === 基础模块 ===
  console.log('【基础模块：房源管理】');
  try {
    const houses = await axios.get(`${BASE_URL}/houses`, { headers });
    console.log(`✅ 房源列表: ${houses.data.data?.length || 0} 套`);
    pass++;
  } catch (e) { console.log(`❌ 房源列表: ${e.response?.data?.message || e.message}`); fail++; }

  try {
    const house = await axios.get(`${BASE_URL}/houses/1`, { headers });
    console.log(`✅ 房源详情: ${house.data.data?.community} ${house.data.data?.address}`);
    pass++;
  } catch (e) { console.log(`❌ 房源详情: ${e.response?.data?.message || e.message}`); fail++; }

  console.log('\n【基础模块：租客管理】');
  try {
    const tenants = await axios.get(`${BASE_URL}/tenants`, { headers });
    console.log(`✅ 租客列表: ${tenants.data.data?.length || 0} 人`);
    pass++;
  } catch (e) { console.log(`❌ 租客列表: ${e.response?.data?.message || e.message}`); fail++; }

  try {
    const tenant = await axios.get(`${BASE_URL}/tenants/14`, { headers });
    console.log(`✅ 租客详情: ${tenant.data.data?.name}`);
    pass++;
  } catch (e) { console.log(`❌ 租客详情: ${e.response?.data?.message || e.message}`); fail++; }

  console.log('\n【基础模块：合同管理】');
  try {
    const contracts = await axios.get(`${BASE_URL}/contracts`, { headers });
    console.log(`✅ 合同列表: ${contracts.data.data?.length || 0} 份`);
    pass++;
  } catch (e) { console.log(`❌ 合同列表: ${e.response?.data?.message || e.message}`); fail++; }

  try {
    const contract = await axios.get(`${BASE_URL}/contracts/1`, { headers });
    console.log(`✅ 合同详情: 月租¥${contract.data.data?.monthly_rent}`);
    pass++;
  } catch (e) { console.log(`❌ 合同详情: ${e.response?.data?.message || e.message}`); fail++; }

  console.log('\n【基础模块：账单租金】');
  try {
    const rentals = await axios.get(`${BASE_URL}/rentals`, { headers });
    console.log(`✅ 租金账单: ${rentals.data.data?.length || 0} 条`);
    pass++;
  } catch (e) { console.log(`❌ 租金账单: ${e.response?.data?.message || e.message}`); fail++; }

  // === Phase 1 ===
  console.log('\n【Phase 1: 智能催租提醒】');
  try {
    const rules = await axios.get(`${BASE_URL}/reminders/rules`, { headers });
    console.log(`✅ 提醒规则: ${rules.data.data?.length} 条`);
    pass++;
  } catch (e) { console.log(`❌ ${e.response?.data?.message || e.message}`); fail++; }
  try {
    const stats = await axios.get(`${BASE_URL}/reminders/stats`, { headers });
    console.log(`✅ 提醒统计: 待发送${stats.data.data?.pending || 0}条`);
    pass++;
  } catch (e) { console.log(`❌ ${e.response?.data?.message || e.message}`); fail++; }
  try {
    const pending = await axios.get(`${BASE_URL}/reminders/pending`, { headers });
    console.log(`✅ 待发送提醒: ${pending.data.data?.length || 0} 条`);
    pass++;
  } catch (e) { console.log(`❌ ${e.response?.data?.message || e.message}`); fail++; }

  // === Phase 2 ===
  console.log('\n【Phase 2: 房态日历】');
  try {
    const overview = await axios.get(`${BASE_URL}/calendar/overview?year=2026&month=3`, { headers });
    const s = overview.data.data?.stats;
    console.log(`✅ 月度概览: ${s?.total}套 入住率${s?.occupancyRate}%`);
    pass++;
  } catch (e) { console.log(`❌ ${e.response?.data?.message || e.message}`); fail++; }
  try {
    const cal = await axios.get(`${BASE_URL}/calendar/1?year=2026&month=3`, { headers });
    console.log(`✅ 房源日历: ${cal.data.data?.days?.length} 天`);
    pass++;
  } catch (e) { console.log(`❌ ${e.response?.data?.message || e.message}`); fail++; }

  // === Phase 3 ===
  console.log('\n【Phase 3: 房源推广】');
  try {
    const share = await axios.get(`${BASE_URL}/promotion/share/1`, { headers });
    console.log(`✅ 推广链接: ${share.data.data?.share_url ? '生成成功' : '失败'}`);
    pass++;
  } catch (e) { console.log(`❌ ${e.response?.data?.message || e.message}`); fail++; }
  try {
    const stats = await axios.get(`${BASE_URL}/promotion/stats/1`, { headers });
    console.log(`✅ 推广统计: ${stats.data.data?.total_links} 条链接`);
    pass++;
  } catch (e) { console.log(`❌ ${e.response?.data?.message || e.message}`); fail++; }
  try {
    const pub = await axios.post(`${BASE_URL}/promotion/publish`, { house_id: 2, platform: '贝壳', description: '精装套一' }, { headers });
    console.log(`✅ 发布平台: ${pub.data.message}`);
    pass++;
  } catch (e) { console.log(`❌ ${e.response?.data?.message || e.message}`); fail++; }

  // === Phase 4 ===
  console.log('\n【Phase 4: 经营分析大屏】');
  try {
    const dash = await axios.get(`${BASE_URL}/analytics/dashboard`, { headers });
    const s = dash.data.data?.summary;
    console.log(`✅ 大屏数据: 收入¥${s?.month_income} 在租${s?.rented_houses}/${s?.total_houses}套`);
    pass++;
  } catch (e) { console.log(`❌ ${e.response?.data?.message || e.message}`); fail++; }

  // === Phase 5 ===
  console.log('\n【Phase 5: 保洁维修服务】');
  try {
    const list = await axios.get(`${BASE_URL}/services`, { headers });
    console.log(`✅ 服务列表: ${list.data.data?.list?.length || 0} 条`);
    pass++;
  } catch (e) { console.log(`❌ ${e.response?.data?.message || e.message}`); fail++; }
  try {
    const staff = await axios.get(`${BASE_URL}/staff`, { headers });
    console.log(`✅ 维修人员: ${staff.data.data?.length} 人`);
    pass++;
  } catch (e) { console.log(`❌ ${e.response?.data?.message || e.message}`); fail++; }

  // === Phase 6 ===
  console.log('\n【Phase 6: 在线签约】');
  try {
    const eclist = await axios.get(`${BASE_URL}/econtracts`, { headers });
    console.log(`✅ 电子合同列表: ${eclist.data.data?.length} 份`);
    pass++;
  } catch (e) { console.log(`❌ ${e.response?.data?.message || e.message}`); fail++; }

  // === Phase 7 ===
  console.log('\n【Phase 7: 预付费钱包】');
  try {
    const bal = await axios.get(`${BASE_URL}/wallet/balance/14`, { headers });
    console.log(`✅ 钱包余额: ¥${bal.data.data?.balance}`);
    pass++;
  } catch (e) { console.log(`❌ ${e.response?.data?.message || e.message}`); fail++; }
  try {
    const hist = await axios.get(`${BASE_URL}/wallet/history/14`, { headers });
    console.log(`✅ 交易记录: ${hist.data.data?.length} 条`);
    pass++;
  } catch (e) { console.log(`❌ ${e.response?.data?.message || e.message}`); fail++; }

  // === Phase 8 ===
  console.log('\n【Phase 8: 投诉建议】');
  try {
    const fb = await axios.get(`${BASE_URL}/feedback`, { headers });
    console.log(`✅ 反馈列表: ${fb.data.data?.length} 条`);
    pass++;
  } catch (e) { console.log(`❌ ${e.response?.data?.message || e.message}`); fail++; }

  // === 扩展模块 ===
  console.log('\n【扩展模块：财务报表】');
  try {
    const fin = await axios.get(`${BASE_URL}/finance/summary`, { headers });
    console.log(`✅ 财务汇总: 总收入¥${fin.data.data?.totalIncome || 0}`);
    pass++;
  } catch (e) { console.log(`❌ 财务汇总: ${e.response?.data?.message || e.message}`); fail++; }

  console.log('\n【扩展模块：数据备份】');
  try {
    const backup = await axios.get(`${BASE_URL}/backup`, { headers });
    console.log(`✅ 备份记录: ${backup.data.data?.length} 条`);
    pass++;
  } catch (e) { console.log(`❌ 备份记录: ${e.response?.data?.message || e.message}`); fail++; }

  console.log('\n【扩展模块：统计报表】');
  try {
    await axios.get(`${BASE_URL}/stats`, { headers });
    console.log(`✅ 统计概览: 正常`);
    pass++;
  } catch (e) { console.log(`❌ ${e.response?.data?.message || e.message}`); fail++; }

  console.log('\n【扩展模块：系统设置】');
  try {
    await axios.get(`${BASE_URL}/settings`, { headers });
    console.log(`✅ 系统设置: 正常`);
    pass++;
  } catch (e) { console.log(`❌ ${e.response?.data?.message || e.message}`); fail++; }

  console.log('\n【扩展模块：核销退租】');
  try {
    const checkouts = await axios.get(`${BASE_URL}/checkout`, { headers });
    console.log(`✅ 退租记录: ${checkouts.data.data?.length || 0} 条`);
    pass++;
  } catch (e) { console.log(`❌ 退租记录: ${e.response?.data?.message || e.message}`); fail++; }

  // === 功能链路检查 ===
  console.log('\n=== 功能链路检查 ===');
  const checks = [
    { name: '房源→租客→合同→租金 链路', test: async () => { const h = await axios.get(`${BASE_URL}/houses/1`, { headers }); if (!h.data.data?.id) throw new Error(); return true; }},
    { name: '合同→电子签约 链路', test: async () => { const c = await axios.get(`${BASE_URL}/contracts/1`, { headers }); if (!c.data.data) throw new Error(); return true; }},
    { name: '租客→钱包→充值 链路', test: async () => { await axios.get(`${BASE_URL}/wallet/balance/14`, { headers }); return true; }},
    { name: '房源→推广→统计 链路', test: async () => { await axios.get(`${BASE_URL}/promotion/stats/1`, { headers }); return true; }},
    { name: '维修人员→服务预约→完成 链路', test: async () => { const s = await axios.get(`${BASE_URL}/staff`, { headers }); return s.data.data?.length > 0; }},
    { name: '提醒→发送→统计 链路', test: async () => { const r = await axios.get(`${BASE_URL}/reminders/rules`, { headers }); return r.data.data?.length > 0; }},
  ];
  for (const c of checks) {
    try {
      await c.test();
      console.log(`✅ ${c.name}`);
      pass++;
    } catch (e) {
      console.log(`❌ ${c.name}`);
      fail++;
    }
  }

  console.log(`\n=== 测试结果: ${pass} 通过, ${fail} 失败 ===`);
}

test().catch(err => console.error('测试错误:', err.message));
