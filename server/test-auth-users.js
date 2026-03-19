const axios = require('axios');

(async () => {
  // Login
  const loginRes = await axios.post('http://localhost:3000/api/auth/login', { username: 'admin', password: 'admin123' });
  const token = loginRes.data.data.token;
  console.log('Token:', token.substring(0, 20) + '...');
  
  // Test auth/users
  try {
    const r = await axios.get('http://localhost:3000/api/auth/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ /api/auth/users OK:', r.data);
  } catch (err) {
    console.log('❌ /api/auth/users:', err.response?.status, err.response?.data);
  }
})();
