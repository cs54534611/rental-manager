const axios = require('axios');
const BASE_URL = 'http://localhost:3000/api';

async function test() {
  console.log('=== 智能催租提醒功能测试 ===\n');

  // 1. 登录
  const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
    username: 'admin',
    password: 'admin123'
  });
  const token = loginRes.data.data?.token;
  console.log('✅ 管理员登录成功');

  const headers = { Authorization: `Bearer ${token}` };

  // 2. 获取提醒规则
  try {
    const rulesRes = await axios.get(`${BASE_URL}/reminders/rules`, { headers });
    console.log(`✅ 获取提醒规则: ${rulesRes.data.data?.length} 条规则`);
    rulesRes.data.data?.forEach(r => {
      console.log(`   [${r.rule_type}] ${r.title} (days_before: ${r.days_before})`);
    });
  } catch (err) {
    console.log('❌ 获取提醒规则失败:', err.response?.data?.message || err.message);
  }

  // 3. 发送所有待到期提醒
  try {
    const sendRes = await axios.post(`${BASE_URL}/reminders/send-all`, {}, { headers });
    console.log(`✅ 发送提醒: ${sendRes.data.message}`);
  } catch (err) {
    console.log('❌ 发送提醒失败:', err.response?.data?.message || err.message);
  }

  // 4. 获取提醒列表
  try {
    const listRes = await axios.get(`${BASE_URL}/reminders`, { headers });
    console.log(`✅ 获取提醒列表: ${listRes.data.data?.total} 条记录`);
  } catch (err) {
    console.log('❌ 获取提醒列表失败:', err.response?.data?.message || err.message);
  }

  // 5. 获取提醒统计
  try {
    const statsRes = await axios.get(`${BASE_URL}/reminders/stats`, { headers });
    console.log(`✅ 获取提醒统计:`, statsRes.data.data);
  } catch (err) {
    console.log('❌ 获取提醒统计失败:', err.response?.data?.message || err.message);
  }

  // 6. 发送单条提醒（给第一条租金记录）
  try {
    const rentalsRes = await axios.get(`${BASE_URL}/rentals`, { headers });
    const firstRental = rentalsRes.data.data?.list?.[0];
    if (firstRental) {
      const sendOneRes = await axios.post(`${BASE_URL}/reminders/send/${firstRental.id}`, {}, { headers });
      console.log(`✅ 发送单条提醒: ${sendOneRes.data.message}`);
    }
  } catch (err) {
    console.log('❌ 发送单条提醒失败:', err.response?.data?.message || err.message);
  }

  // 7. 再次获取提醒列表
  try {
    const listRes2 = await axios.get(`${BASE_URL}/reminders`, { headers });
    console.log(`✅ 更新后提醒列表: ${listRes2.data.data?.total} 条记录`);
  } catch (err) {
    console.log('❌ 获取提醒列表失败:', err.response?.data?.message || err.message);
  }

  console.log('\n=== 测试完成 ===');
}

test().catch(err => console.error('测试错误:', err.message));
