const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Develop@123',
    database: 'rental_db'
  });
  
  console.log('=== 检查数据完整性 ===\n');
  
  // 1. 检查租客表
  const [tenants] = await conn.execute('SELECT id, name, phone FROM tenants ORDER BY id');
  console.log('👤 租客列表:');
  tenants.forEach(t => console.log(`  ID:${t.id} - ${t.name} (${t.phone})`));
  
  // 2. 检查管理员账号
  const [admins] = await conn.execute('SELECT id, username, role, name, phone FROM admin_users ORDER BY id');
  console.log('\n👥 管理员/租客账号:');
  admins.forEach(a => console.log(`  ID:${a.id} - ${a.username} (${a.role}) - ${a.name}`));
  
  // 3. 检查租客关联
  console.log('\n🔗 租客账号绑定情况:');
  for (const t of tenants) {
    const [linked] = await conn.execute('SELECT id, username, role FROM admin_users WHERE phone = ?', [t.phone]);
    if (linked.length > 0) {
      console.log(`  ✅ ${t.phone} (${t.name}) -> 已绑定 ${linked[0].role} 账号`);
    } else {
      console.log(`  ❌ ${t.phone} (${t.name}) -> 未绑定`);
    }
  }
  
  // 4. 创建缺失的租客账号
  console.log('\n=== 创建缺失的租客账号 ===');
  const hashedPassword = '$2b$10$PgnyUP/ynhZPCa6Yx9vwoOuNj/sUT4rSWQG.T/gvaAaRWzJyrvJhG'; // admin123
  
  // 为所有唯一租客手机号创建账号
  const uniquePhones = [...new Set(tenants.map(t => t.phone).filter(p => p))];
  
  for (const phone of uniquePhones) {
    const [existing] = await conn.execute('SELECT id FROM admin_users WHERE phone = ?', [phone]);
    if (existing.length === 0) {
      const tenant = tenants.find(t => t.phone === phone);
      await conn.execute(
        'INSERT INTO admin_users (username, password, role, name, phone, status) VALUES (?, ?, ?, ?, ?, ?)',
        [phone, hashedPassword, 'tenant', tenant?.name || '租客', phone, 1]
      );
      console.log(`  ✅ 创建租客账号: ${phone}`);
    } else {
      console.log(`  ⏭️  已存在: ${phone}`);
    }
  }
  
  console.log('\n✅ 完成!');
  
  await conn.end();
})();
