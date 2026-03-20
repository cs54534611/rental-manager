const axios = require('axios');
const BASE_URL = 'http://localhost:3000/api';

async function test() {
  console.log('=== Phase 1-8 功能测试 ===\n');

  const loginRes = await axios.post(`${BASE_URL}/auth/login`, { username: 'admin', password: 'admin123' });
  const token = loginRes.data.data?.token;
  const headers = { Authorization: `Bearer ${token}` };
  console.log('✅ 管理员登录成功\n');

  // Phase 1-5 快速验证
  try {
    await axios.get(`${BASE_URL}/reminders/rules`, { headers });
    await axios.get(`${BASE_URL}/calendar/overview?year=2026&month=3`, { headers });
    await axios.get(`${BASE_URL}/analytics/dashboard`, { headers });
    console.log('✅ Phase 1-5 正常\n');
  } catch (e) { console.log('❌ Phase 1-5:', e.message); }

  // Phase 6: 电子合同
  console.log('【Phase 6: 在线签约】');
  try {
    const init = await axios.post(`${BASE_URL}/econtracts/initiate`, { contract_id: 1 }, { headers });
    console.log(`✅ 发起签署: ${init.data.message}`);
    const sign = await axios.post(`${BASE_URL}/econtracts/${init.data.data.id}/sign`, { sign_type: 'tenant' }, { headers });
    console.log(`✅ 签署: ${sign.data.message}`);
  } catch (e) { console.log(`❌ ${e.response?.data?.message || e.message}`); }

  // Phase 7: 预付费钱包
  console.log('\n【Phase 7: 预付费钱包】');
  try {
    const topup = await axios.post(`${BASE_URL}/wallet/topup`, { tenant_id: 14, amount: 1000 }, { headers });
    console.log(`✅ 充值: ${topup.data.message}, 余额: ¥${topup.data.data.new_balance}`);
    const balance = await axios.get(`${BASE_URL}/wallet/balance/14`, { headers });
    console.log(`✅ 余额查询: ¥${balance.data.data.balance}`);
  } catch (e) { console.log(`❌ ${e.response?.data?.message || e.message}`); }

  // Phase 8: 投诉建议
  console.log('\n【Phase 8: 投诉建议】');
  try {
    const submit = await axios.post(`${BASE_URL}/feedback/submit`, {
      tenant_id: 14, type: 'suggestion', content: '建议增加在线签约功能'
    }, { headers });
    console.log(`✅ 提交反馈: ${submit.data.message}`);
    const list = await axios.get(`${BASE_URL}/feedback`, { headers });
    console.log(`✅ 反馈列表: ${list.data.data.length} 条`);
    const reply = await axios.put(`${BASE_URL}/feedback/${submit.data.data.id}/reply`, { reply: '感谢您的建议' }, { headers });
    console.log(`✅ 回复: ${reply.data.message}`);
  } catch (e) { console.log(`❌ ${e.response?.data?.message || e.message}`); }

  console.log('\n=== 测试完成 ===');
}

test().catch(err => console.error('测试错误:', err.message));
