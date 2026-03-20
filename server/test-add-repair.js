const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function login(username, password) {
  const res = await axios.post(`${BASE_URL}/auth/login`, { username, password });
  return res.data.data.token;
}

async function addRepairStaff() {
  console.log('🔧 添加维修人员测试\n');
  
  // 1. 管理员登录
  const adminToken = await login('admin', 'admin123');
  console.log('1. 管理员登录: ✅');
  
  // 2. 添加维修人员
  const staffData = {
    name: '张师傅',
    phone: '13800138999',
    specialty: '水电维修',
    remark: '专业水电维修师傅'
  };
  
  try {
    const res = await axios.post(`${BASE_URL}/staff`, staffData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('2. 添加维修人员: ✅', res.data);
  } catch (err) {
    console.log('2. 添加维修人员:', err.response?.data || err.message);
  }
  
  // 3. 获取维修人员列表
  try {
    const res = await axios.get(`${BASE_URL}/staff`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('3. 维修人员列表: ✅', res.data.data.length, '人');
    res.data.data.forEach(s => console.log(`   - ${s.name} (${s.phone}) - ${s.specialty}`));
  } catch (err) {
    console.log('3. 获取维修人员:', err.response?.data || err.message);
  }
  
  // 4. 创建维修人员账号（通过租客登录方式）
  // 先添加租客账号
  try {
    const tenantData = {
      name: '张师傅',
      phone: '13800138999',
      idcard: '510000199001011234',
      gender: 1
    };
    const res = await axios.post(`${BASE_URL}/tenants`, tenantData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('4. 添加租客关联: ✅');
  } catch (err) {
    console.log('4. 添加租客:', err.response?.data?.message || '可能已存在');
  }
  
  // 5. 为维修人员创建登录账号
  try {
    const userData = {
      username: '13800138999',
      password: 'repair123',
      role: 'repair',
      name: '张师傅',
      phone: '13800138999'
    };
    const res = await axios.post(`${BASE_URL}/auth/users`, userData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('5. 创建维修账号: ✅');
  } catch (err) {
    console.log('5. 创建维修账号:', err.response?.data?.message || '可能已存在');
  }
  
  // 6. 测试维修人员登录
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      username: '13800138999',
      password: 'repair123',
      loginType: 'tenant'
    });
    console.log('6. 维修人员登录: ✅', res.data.data.user);
  } catch (err) {
    console.log('6. 维修人员登录:', err.response?.data?.message || err.message);
  }
  
  console.log('\n✅ 维修人员添加完成！');
}

addRepairStaff().catch(console.error);
