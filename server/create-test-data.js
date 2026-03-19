const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Develop@123',
    database: 'rental_db'
  });
  
  // 使用与admin相同的密码哈希（admin123）
  const adminHash = '$2b$10$PgnyUP/ynhZPCa6Yx9vwoOuNj/sUT4rSWQG.T/gvaAaRWzJyrvJhG';
  
  // 1. 确保租客存在
  await conn.execute(
    `INSERT IGNORE INTO tenants (name, gender, phone, id_card, emergency_contact, emergency_phone, remark) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['李先生', 1, '13900001111', '110101199001011234', '张三', '13800138000', '测试租客']
  );
  
  // 2. 创建租客登录账号
  await conn.execute(
    `INSERT IGNORE INTO admin_users (username, password, role, name, phone, status) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['13900001111', adminHash, 'tenant', '李先生', '13900001111', 1]
  );
  
  // 3. 获取租客ID和房源ID
  const [tenants] = await conn.execute('SELECT id FROM tenants WHERE phone = ?', ['13900001111']);
  const [houses] = await conn.execute('SELECT id FROM houses LIMIT 1');
  
  if (houses.length === 0) {
    console.log('❌ 没有房源，请先添加房源');
    await conn.end();
    return;
  }
  
  const tenantId = tenants[0].id;
  const houseId = houses[0].id;
  const startDate = '2026-01-01';
  const endDate = '2026-12-31';
  
  // 4. 创建合同 (使用正确的字段名)
  await conn.execute(
    `INSERT IGNORE INTO contracts (contract_no, house_id, tenant_id, type, start_date, end_date, monthly_rent, deposit, payment_method, status, remark)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['CT20260101', houseId, tenantId, 1, startDate, endDate, 2000, 4000, 1, 1, '测试合同']
  );
  
  // 5. 创建租金记录
  const currentMonth = new Date().toISOString().slice(0, 7);
  await conn.execute(
    `INSERT IGNORE INTO rentals (house_id, tenant_id, period, receivable, actual, status, due_date, remark)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [houseId, tenantId, currentMonth, 2000, 2000, 1, '2026-03-25', '已支付']
  );
  
  console.log('✅ 测试数据创建成功!');
  console.log('');
  console.log('┌─────────────────────────────────────┐');
  console.log('│  租客: 李先生                       │');
  console.log('│  手机: 13900001111                 │');
  console.log('│  密码: admin123                    │');
  console.log('│  登录类型: 租客                    │');
  console.log('├─────────────────────────────────────┤');
  console.log('│  合同: CT20260101                  │');
  console.log('│  租金: 2000元/月                   │');
  console.log('│  状态: 已支付                       │');
  console.log('└─────────────────────────────────────┘');
  
  await conn.end();
})();
