const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function checkData() {
  // Login as admin
  const loginRes = await axios.post(`${BASE_URL}/auth/login`, { username: 'admin', password: 'admin123' });
  const token = loginRes.data.data.token;
  console.log('✅ 登录成功\n');
  
  const headers = { Authorization: `Bearer ${token}` };
  
  // Check houses
  const housesRes = await axios.get(`${BASE_URL}/houses?pageSize=100`, { headers });
  console.log('📦 房源数量:', housesRes.data.data.total);
  
  // Check tenants
  const tenantsRes = await axios.get(`${BASE_URL}/tenants?pageSize=100`, { headers });
  console.log('👤 租客数量:', tenantsRes.data.data.total);
  
  // Check contracts
  const contractsRes = await axios.get(`${BASE_URL}/contracts?pageSize=100`, { headers });
  console.log('📄 合同数量:', contractsRes.data.data.total);
  
  // Check rentals
  const rentalsRes = await axios.get(`${BASE_URL}/rentals?pageSize=100`, { headers });
  console.log('💰 租金账单:', rentalsRes.data.data.total);
  
  // Check repairs
  const repairsRes = await axios.get(`${BASE_URL}/repairs?pageSize=100`, { headers });
  console.log('🔧 报修记录:', repairsRes.data.data.total);
  
  // List houses
  console.log('\n📋 房源列表:');
  housesRes.data.data.list.forEach(h => {
    console.log(`  - ${h.community} ${h.address} (状态:${h.status})`);
  });
  
  // List tenants
  console.log('\n📋 租客列表:');
  tenantsRes.data.data.list.forEach(t => {
    console.log(`  - ${t.name} ${t.phone}`);
  });
  
  // List contracts
  console.log('\n📋 合同列表:');
  contractsRes.data.data.list.forEach(c => {
    console.log(`  - ${c.contract_no} 状态:${c.status}`);
  });
}

checkData().catch(console.error);
