const axios = require('axios');

async function test() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJzdXBlciIsImlhdCI6MTc3MzkwMzM0MywiZXhwIjoxNzc0NTA4MTQzfQ.v1sWAudhlfXq1TzNq6-MmVVCkJFmmtG5zMP-PufalTE';
  
  console.log('=== 测试需要认证的接口 ===\n');
  
  // 测试房源列表（需要认证）
  try {
    const res = await axios.get('http://localhost:3000/api/houses', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ GET /api/houses (需要认证): 成功');
  } catch (err) {
    console.log('❌ GET /api/houses (需要认证): ' + (err.response?.data?.message || err.message));
  }
  
  // 测试房源列表（无需认证）
  try {
    const res = await axios.get('http://localhost:3000/api/houses');
    console.log('❌ GET /api/houses (未认证): 不应该成功！');
  } catch (err) {
    console.log('✅ GET /api/houses (未认证): 正确拒绝 - ' + (err.response?.data?.message || err.message));
  }
  
  // 测试健康检查（无需认证）
  try {
    const res = await axios.get('http://localhost:3000/api/health');
    console.log('✅ GET /api/health (无需认证): 成功');
  } catch (err) {
    console.log('❌ GET /api/health: ' + err.message);
  }
  
  console.log('\n=== 安全修复验证完成 ===');
}

test();
