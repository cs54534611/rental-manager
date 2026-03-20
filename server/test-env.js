require('dotenv').config({ path: __dirname + '/.env' });
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_USER:', process.env.DB_USER);
