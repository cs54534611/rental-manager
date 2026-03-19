const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Develop@123',
    database: 'rental_db'
  });
  
  // 查看contracts表结构
  const [cols] = await conn.execute('DESCRIBE contracts');
  console.log('contracts表字段:');
  cols.forEach(c => console.log(c.Field));
  
  await conn.end();
})();
