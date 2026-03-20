const bcrypt = require('bcrypt');
bcrypt.hash('repair123', 10).then(h => console.log(h));
