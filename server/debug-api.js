const axios = require('axios');
(async () => {
  const res = await axios.post('http://localhost:3000/api/auth/login', {username:'admin',password:'admin123'});
  const token = res.data.data.token;
  
  // 支付记录
  try {
    const r1 = await axios.get('http://localhost:3000/api/payments', {headers:{Authorization:'Bearer '+token}});
    console.log('支付记录:', JSON.stringify(r1.data).substring(0,300));
  } catch(e) { console.log('支付错误:', e.response?.data); }
  
  // 收入趋势
  try {
    const r2 = await axios.get('http://localhost:3000/api/stats/income/trend', {headers:{Authorization:'Bearer '+token}});
    console.log('收入趋势:', JSON.stringify(r2.data).substring(0,300));
  } catch(e) { console.log('趋势错误:', e.response?.data); }
})();
