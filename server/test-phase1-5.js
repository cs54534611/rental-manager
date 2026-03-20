const axios = require('axios');
const BASE_URL = 'http://localhost:3000/api';

async function test() {
  console.log('=== Phase 1-5 功能测试 ===\n');

  const loginRes = await axios.post(`${BASE_URL}/auth/login`, { username: 'admin', password: 'admin123' });
  const token = loginRes.data.data?.token;
  const headers = { Authorization: `Bearer ${token}` };
  console.log('✅ 管理员登录成功\n');

  // Phase 1-3 快速验证
  console.log('【Phase 1-3】');
  try {
    const r = await axios.get(`${BASE_URL}/reminders/rules`, { headers });
    const c = await axios.get(`${BASE_URL}/calendar/overview?year=2026&month=3`, { headers });
    const p = await axios.get(`${BASE_URL}/promotion/stats/1`, { headers });
    console.log(`✅ 提醒规则:${r.data.data?.length} 房源概览:${c.data.data?.stats?.total}套 推广统计:正常`);
  } catch (err) { console.log(`❌ ${err.response?.data?.message || err.message}`); }

  // Phase 4: 经营分析大屏
  console.log('\n【Phase 4: 经营分析大屏】');
  try {
    const d = await axios.get(`${BASE_URL}/analytics/dashboard`, { headers });
    const s = d.data.data?.summary;
    console.log(`✅ 大屏数据:`);
    console.log(`   房源总数: ${s?.total_houses}, 在租: ${s?.rented_houses}, 入住率: ${s?.occupancy_rate}%`);
    console.log(`   本月收入: ¥${s?.month_income}, 待收: ¥${s?.pending_amount}`);
    console.log(`   预警: ${s?.warnings?.length || 0} 条`);
  } catch (err) { console.log(`❌ ${err.response?.data?.message || err.message}`); }

  // Phase 5: 保洁维修服务
  console.log('\n【Phase 5: 保洁维修服务】');
  try {
    // 预约服务
    const book = await axios.post(`${BASE_URL}/services/book`, {
      house_id: 1, type: 'repair', description: '水管漏水维修'
    }, { headers });
    console.log(`✅ 预约服务: ${book.data.message}`);
    
    // 服务列表
    const list = await axios.get(`${BASE_URL}/services`, { headers });
    console.log(`✅ 服务列表: ${list.data.data?.list?.length || 0} 条`);
    
    // 派单
    const dispatch = await axios.put(`${BASE_URL}/services/${book.data.data?.id}/dispatch`, { staff_id: 1 }, { headers });
    console.log(`✅ 派单: ${dispatch.data.message}`);
    
    // 完成
    const complete = await axios.put(`${BASE_URL}/services/${book.data.data?.id}/complete`, { fee: 200 }, { headers });
    console.log(`✅ 完成服务: ${complete.data.message}`);
  } catch (err) { console.log(`❌ ${err.response?.data?.message || err.message}`); }

  console.log('\n=== 测试完成 ===');
}

test().catch(err => console.error('测试错误:', err.message));
