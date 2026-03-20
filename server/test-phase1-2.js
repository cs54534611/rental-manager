const axios = require('axios');
const BASE_URL = 'http://localhost:3000/api';

async function test() {
  console.log('=== Phase 1+2 功能测试 ===\n');

  const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
    username: 'admin',
    password: 'admin123'
  });
  const token = loginRes.data.data?.token;
  const headers = { Authorization: `Bearer ${token}` };
  console.log('✅ 管理员登录成功\n');

  // Phase 1: 催租提醒
  console.log('【Phase 1: 催租提醒】');
  try {
    const rulesRes = await axios.get(`${BASE_URL}/reminders/rules`, { headers });
    console.log(`✅ 提醒规则: ${rulesRes.data.data?.length} 条`);
  } catch (err) {
    console.log(`❌ 提醒规则: ${err.response?.data?.message}`);
  }

  // Phase 2: 房态日历
  console.log('\n【Phase 2: 房态日历】');
  try {
    const calRes = await axios.get(`${BASE_URL}/calendar/1?year=2026&month=3`, { headers });
    console.log(`✅ 日历数据: ${calRes.data.data?.days?.length} 天`);
    console.log(`   占用: ${calRes.data.data?.summary?.occupiedDays} 天`);
    console.log(`   可租: ${calRes.data.data?.summary?.availableDays} 天`);
  } catch (err) {
    console.log(`❌ 日历数据: ${err.response?.data?.message}`);
  }

  try {
    const overviewRes = await axios.get(`${BASE_URL}/calendar/overview?year=2026&month=3`, { headers });
    console.log(`✅ 月度概览: ${overviewRes.data.data?.houses?.length} 套房源`);
    console.log(`   入住率: ${overviewRes.data.data?.stats?.occupancyRate}%`);
  } catch (err) {
    console.log(`❌ 月度概览: ${err.response?.data?.message}`);
  }

  console.log('\n=== 测试完成 ===');
}

test().catch(err => console.error('测试错误:', err.message));
