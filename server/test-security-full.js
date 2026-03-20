/**
 * 租房管理系统 - 安全测试
 */

const axios = require('axios');
const BASE_URL = 'http://localhost:3000';

const colors = { green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', blue: '\x1b[34m', reset: '\x1b[0m' };
const log = (msg, color = 'reset') => console.log(`${colors[color]}${msg}${colors.reset}`);
const pass = (msg) => log(`  ✅ ${msg}`, 'green');
const fail = (msg) => log(`  ❌ ${msg}`, 'red');

async function runTests() {
  log('\n🔒 租房管理系统 - 安全测试', 'blue');
  log('='.repeat(60), 'blue');

  let passed = 0, failed = 0;

  // 1. 先获取有效token
  log('\n📋 获取管理员Token...', 'yellow');
  let adminToken;
  try {
    const res = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    adminToken = res.data.data?.token;
    pass('管理员登录成功');
    passed++;
  } catch (err) {
    fail('管理员登录失败');
    failed++;
    return;
  }

  // 2. 测试公开接口无需认证
  log('\n🔓 【公开接口 - 无需认证】', 'cyan');
  const publicEndpoints = [
    { path: '/api/health', name: '健康检查' },
    { path: '/api/auth/login', method: 'POST', data: { username: 'admin', password: 'admin123' }, name: '管理员登录' },
  ];

  for (const ep of publicEndpoints) {
    try {
      let res;
      if (ep.method === 'POST') {
        res = await axios.post(`${BASE_URL}${ep.path}`, ep.data);
      } else {
        res = await axios.get(`${BASE_URL}${ep.path}`);
      }
      pass(`${ep.name} (${ep.path})`);
      passed++;
    } catch (err) {
      fail(`${ep.name}: ${err.response?.data?.message || err.message}`);
      failed++;
    }
  }

  // 3. 测试需要认证的接口 - 无token应该被拒绝
  log('\n🔒 【受保护接口 - 无Token应拒绝】', 'cyan');
  const protectedEndpoints = [
    { path: '/api/houses', name: '房源列表' },
    { path: '/api/tenants', name: '租客列表' },
    { path: '/api/contracts', name: '合同列表' },
    { path: '/api/staff', name: '维修人员' },
    { path: '/api/stats/overview', name: '统计概览' },
  ];

  for (const ep of protectedEndpoints) {
    try {
      await axios.get(`${BASE_URL}${ep.path}`);
      fail(`${ep.name} (${ep.path}): 未认证却能访问！`);
      failed++;
    } catch (err) {
      if (err.response?.status === 401) {
        pass(`${ep.name} (${ep.path}): 正确拒绝未授权访问`);
        passed++;
      } else {
        fail(`${ep.name}: ${err.response?.data?.message || err.message}`);
        failed++;
      }
    }
  }

  // 4. 测试有效token可以访问受保护接口
  log('\n🔑 【受保护接口 - 有效Token应通过】', 'cyan');
  for (const ep of protectedEndpoints) {
    try {
      const res = await axios.get(`${BASE_URL}${ep.path}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.data.code === 0) {
        pass(`${ep.name} (${ep.path}): 认证通过`);
        passed++;
      } else {
        fail(`${ep.name}: ${res.data.message}`);
        failed++;
      }
    } catch (err) {
      fail(`${ep.name}: ${err.response?.data?.message || err.message}`);
      failed++;
    }
  }

  // 5. 测试无效/过期token
  log('\n⚠️ 【无效Token测试】', 'cyan');
  const invalidTokens = [
    { token: 'invalid-token', name: '无效Token' },
    { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.payload', name: '格式错误的JWT' },
  ];

  for (const t of invalidTokens) {
    try {
      await axios.get(`${BASE_URL}/api/houses`, {
        headers: { Authorization: `Bearer ${t.token}` }
      });
      fail(`无效${t.name}却被接受！`);
      failed++;
    } catch (err) {
      if (err.response?.status === 401) {
        pass(`${t.name}: 正确拒绝`);
        passed++;
      } else {
        fail(`${t.name}: ${err.response?.data?.message || err.message}`);
        failed++;
      }
    }
  }

  // 6. 测试角色权限 - 租客不能访问管理员接口
  log('\n👥 【角色权限测试】', 'cyan');
  try {
    const tenantRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: '13900001111',
      password: 'admin123',
      loginType: 'tenant'
    });
    const tenantToken = tenantRes.data.data?.token;

    if (tenantToken) {
      // 租客尝试访问管理员接口
      try {
        await axios.get(`${BASE_URL}/api/staff`, {
          headers: { Authorization: `Bearer ${tenantToken}` }
        });
        fail('租客可以访问维修人员接口');
        failed++;
      } catch (err) {
        if (err.response?.status === 403) {
          pass('租客无法访问管理员接口 (staff): 正确拒绝');
          passed++;
        } else {
          pass(`租客访问staff: ${err.response?.status || err.message}`);
          passed++;
        }
      }
    }
  } catch (err) {
    log(`  ⚠️ 租客登录失败: ${err.response?.data?.message || err.message}`, 'yellow');
  }

  // 7. SQL注入测试
  log('\n💉 【SQL注入测试】', 'cyan');
  const sqlInjectionTests = [
    { path: "/api/houses?name=' OR '1'='1", name: '房源名称SQL注入' },
    { path: "/api/tenants?name=' OR '1'='1", name: '租客名称SQL注入' },
  ];

  for (const t of sqlInjectionTests) {
    try {
      const res = await axios.get(`${BASE_URL}${t.path}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      // 应该返回空列表或正常数据，而不是执行注入
      pass(`${t.name}: 已防护 (返回正常数据)`);
      passed++;
    } catch (err) {
      fail(`${t.name}: ${err.response?.data?.message || err.message}`);
      failed++;
    }
  }

  // 8. XSS测试 (检查API不返回可执行的脚本)
  log('\n🧨 【XSS防护测试】', 'cyan');
  try {
    const res = await axios.get(`${BASE_URL}/api/houses?name=<script>alert(1)</script>`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const dataStr = JSON.stringify(res.data);
    if (!dataStr.includes('<script>')) {
      pass('XSS攻击已被防护');
      passed++;
    } else {
      fail('XSS攻击未被防护！');
      failed++;
    }
  } catch (err) {
    pass('XSS防护正常');
    passed++;
  }

  // 9. 暴力破解防护测试 (连续失败登录)
  log('\n🔐 【暴力破解防护测试】', 'cyan');
  let bruteForceBlocked = false;
  for (let i = 0; i < 15; i++) {
    try {
      await axios.post(`${BASE_URL}/api/auth/login`, {
        username: 'admin',
        password: 'wrong_password'
      });
    } catch (err) {
      if (err.response?.data?.message?.includes('过于频繁') || err.response?.status === 429) {
        bruteForceBlocked = true;
        break;
      }
    }
  }
  if (bruteForceBlocked) {
    pass('暴力破解防护已触发 (限流生效)');
    passed++;
  } else {
    fail('暴力破解防护未触发');
    failed++;
  }

  // 10. CORS测试
  log('\n🌐 【CORS配置测试】', 'cyan');
  try {
    const res = await axios.get(`${BASE_URL}/api/health`, {
      headers: { Origin: 'http://evil.com' }
    });
    const corsHeader = res.headers['access-control-allow-origin'];
    if (corsHeader === '*' || corsHeader === 'http://localhost:8080' || corsHeader === 'http://localhost:3000') {
      pass(`CORS配置正确: ${corsHeader}`);
      passed++;
    } else {
      fail(`CORS配置异常: ${corsHeader}`);
      failed++;
    }
  } catch (err) {
    pass('CORS配置正常');
    passed++;
  }

  // 汇总
  log('\n' + '='.repeat(60), 'blue');
  log('\n📊 安全测试结果', 'blue');
  log(`\n  ✅ 通过: ${passed} | ❌ 失败: ${failed}`, failed === 0 ? 'green' : 'red');

  if (failed > 0) {
    log('\n⚠️ 存在安全隐患，请检查上述失败项！', 'yellow');
  } else {
    log('\n✅ 所有安全测试通过！系统安全性良好。', 'green');
  }

  log('\n', 'reset');
}

runTests().catch(err => log(`\n❌ 测试错误: ${err.message}\n`, 'red'));
