const axios = require('axios');
const BASE_URL = 'http://localhost:3000/api';

async function test() {
  console.log('=== Phase 1-3 功能测试 ===\n');

  const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
    username: 'admin', password: 'admin123'
  });
  const token = loginRes.data.data?.token;
  const headers = { Authorization: `Bearer ${token}` };
  console.log('✅ 管理员登录成功\n');

  // Phase 1: 催租提醒
  console.log('【Phase 1: 智能催租提醒】');
  try {
    const r = await axios.get(`${BASE_URL}/reminders/rules`, { headers });
    console.log(`✅ 提醒规则: ${r.data.data?.length} 条`);
    const s = await axios.get(`${BASE_URL}/reminders/stats`, { headers });
    console.log(`✅ 提醒统计: 待发送${s.data.data?.pending}, 已发送${s.data.data?.sent}`);
  } catch (err) {
    console.log(`❌ ${err.response?.data?.message || err.message}`);
  }

  // Phase 2: 房态日历
  console.log('\n【Phase 2: 房态日历】');
  try {
    const cal = await axios.get(`${BASE_URL}/calendar/1?year=2026&month=3`, { headers });
    console.log(`✅ 房源日历: ${cal.data.data?.days?.length} 天`);
    const ov = await axios.get(`${BASE_URL}/calendar/overview?year=2026&month=3`, { headers });
    console.log(`✅ 月度概览: ${ov.data.data?.stats?.total} 套, 入住率${ov.data.data?.stats?.occupancyRate}%`);
  } catch (err) {
    console.log(`❌ ${err.response?.data?.message || err.message}`);
  }

  // Phase 3: 房源推广
  console.log('\n【Phase 3: 房源推广】');
  try {
    // 生成推广链接
    const share = await axios.get(`${BASE_URL}/promotion/share/1`, { headers });
    console.log(`✅ 推广链接: ${share.data.data?.share_url}`);
    // 发布到平台
    const pub = await axios.post(`${BASE_URL}/promotion/publish`, {
      house_id: 1, platform: '58同城', description: '精装好房'
    }, { headers });
    console.log(`✅ 发布平台: ${pub.data.message}`);
    // 推广统计
    const stats = await axios.get(`${BASE_URL}/promotion/stats/1`, { headers });
    console.log(`✅ 推广统计: ${stats.data.data?.total_views} 浏览, ${stats.data.data?.total_inquiries} 咨询`);
  } catch (err) {
    console.log(`❌ ${err.response?.data?.message || err.message}`);
  }

  console.log('\n=== 测试完成 ===');
}

test().catch(err => console.error('测试错误:', err.message));
