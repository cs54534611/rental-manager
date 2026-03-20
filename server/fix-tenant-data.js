const mysql = require('mysql2/promise');

async function main() {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Develop@123',
    database: 'rental_db',
    charset: 'utf8mb4'
  });

  console.log('=== 第3步：清理重复的租客记录 ===\n');

  // 查看重复的租客记录
  const [duplicates] = await pool.query(
    "SELECT id, phone, name FROM tenants WHERE phone = '13900001111' ORDER BY id"
  );
  console.log('重复的租客记录:', duplicates);

  // 保留 id=14，删除其他
  if (duplicates.length > 1) {
    const toDelete = duplicates.filter(t => t.id !== 14).map(t => t.id);
    console.log('删除 ID:', toDelete);

    for (const id of toDelete) {
      await pool.query("DELETE FROM tenants WHERE id = ?", [id]);
      console.log(`已删除租客 ID=${id}`);
    }
  }

  // 验证清理结果
  const [remaining] = await pool.query(
    "SELECT id, phone, name FROM tenants WHERE phone = '13900001111'"
  );
  console.log('\n清理后租客记录:', remaining);

  console.log('\n=== 第4步：创建测试合同和租金数据 ===\n');

  // 获取房源列表
  const [houses] = await pool.query("SELECT id FROM houses LIMIT 1");
  const houseId = houses[0]?.id || 1;
  console.log('使用房源 ID:', houseId);

  // 创建合同
  const contractNo = 'HT-' + Date.now();
  try {
    const [contractResult] = await pool.query(`
      INSERT INTO contracts (contract_no, house_id, tenant_id, type, start_date, end_date, monthly_rent, payment_method, deposit, status)
      VALUES (?, ?, 14, 1, '2024-01-01', '2025-12-31', 2000, 1, 4000, 1)
    `, [contractNo, houseId]);
    const contractId = contractResult.insertId;
    console.log('已创建合同 ID:', contractId, '合同编号:', contractNo);

    // 创建租金记录
    const months = [
      { year: 2024, month: 1 }, { year: 2024, month: 2 }, { year: 2024, month: 3 },
      { year: 2024, month: 4 }, { year: 2024, month: 5 }, { year: 2024, month: 6 },
      { year: 2025, month: 1 }, { year: 2025, month: 2 }, { year: 2025, month: 3 },
    ];

    for (const m of months) {
      const billNo = 'ZD-' + Date.now() + '-' + m.month;
      const dueDate = new Date(m.year, m.month - 1, 10);
      await pool.query(`
        INSERT INTO rentals (bill_no, contract_id, house_id, tenant_id, period, receivable, due_date, status)
        VALUES (?, ?, ?, 14, ?, ?, ?, 1)
      `, [billNo, contractId, houseId, `${m.year}-${String(m.month).padStart(2, '0')}`, 2000, dueDate]);
    }
    console.log('已创建9个月租金记录');
  } catch (err) {
    console.log('创建数据出错:', err.message);
  }

  // 验证结果
  console.log('\n=== 验证结果 ===');
  const [contracts] = await pool.query(
    "SELECT id, contract_no, house_id, status FROM contracts WHERE tenant_id = 14"
  );
  console.log('租客合同:', contracts);

  const [rentals] = await pool.query(
    "SELECT id, period, receivable, status FROM rentals WHERE tenant_id = 14 LIMIT 5"
  );
  console.log('租客租金(前5条):', rentals);

  await pool.end();
  console.log('\n✅ 完成！');
}

main().catch(console.error);
