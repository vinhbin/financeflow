// config/dbConfig.js
const mysql = require('mysql2/promise');
const config = require('./config'); // Adjust the path if necessary

const db = mysql.createPool({
  host: config.MYSQLHost,
  user: config.MYSQLUser,
  password: config.MYSQLPassword,
  database: config.MYSQLDatabase,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = db;
