const bcrypt = require('bcrypt');
const p = '$2b$10$9QIwrMo5agveAqDZM6BiXO4J0xZot9GCYzDBESI6Sk66bMluxdyzG';
bcrypt.compare('repair123', p).then(r => console.log('Result:', r));
