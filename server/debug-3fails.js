const axios = require('axios');
const BASE_URL = 'http://localhost:3000/api';

async function debug() {
  const loginRes = await axios.post(`${BASE_URL}/auth/login`, { username: 'admin', password: 'admin123' });
  const token = loginRes.data.data?.token;
  const headers = { Authorization: `Bearer ${token}` };

  // Debug backup
  try {
    const r = await axios.get(`${BASE_URL}/backup/list`, { headers });
    console.log('backup/list OK:', JSON.stringify(r.data).substring(0, 100));
  } catch (e) {
    console.log('backup/list ERROR:', e.response?.status, e.response?.data?.message || e.message);
    // Try other paths
    try {
      const r2 = await axios.get(`${BASE_URL}/backup`, { headers });
      console.log('backup OK:', JSON.stringify(r2.data).substring(0, 100));
    } catch (e2) { console.log('backup ERROR:', e2.response?.status); }
  }

  // Debug checkout
  try {
    const r = await axios.get(`${BASE_URL}/checkout`, { headers });
    console.log('checkout OK:', JSON.stringify(r.data).substring(0, 100));
  } catch (e) {
    console.log('checkout ERROR:', e.response?.status, e.response?.data?.message || e.message);
  }

  // Debug finance
  try {
    const r = await axios.get(`${BASE_URL}/finance/summary`, { headers });
    console.log('finance OK:', JSON.stringify(r.data).substring(0, 100));
  } catch (e) {
    console.log('finance ERROR:', e.response?.status, e.response?.data?.message || e.message);
  }
}

debug().catch(console.error);
