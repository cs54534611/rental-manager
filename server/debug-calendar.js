const axios = require('axios');
const BASE_URL = 'http://localhost:3000/api';

async function test() {
  const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
    username: 'admin',
    password: 'admin123'
  });
  const token = loginRes.data.data?.token;
  const headers = { Authorization: `Bearer ${token}` };

  // Debug calendar overview
  try {
    const res = await axios.get(`${BASE_URL}/calendar/overview?year=2026&month=3`, { headers });
    console.log('Response:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.log('Error:', err.response?.data || err.message);
  }
}

test();
