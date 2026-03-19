const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Develop@123',
    database: 'rental_db'
  });
  
  const [cols] = await conn.execute('DESCRIBE transactions');
  console.log('transactions表结构:');
  cols.forEach(c => console.log(`  ${c.Field} (${c.Type})`));
  
  await conn.end();
})();
