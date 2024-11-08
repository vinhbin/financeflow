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

// Optional: Log pool status periodically (every 5 minutes)
setInterval(async () => {
  try {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM information_schema.processlist');
    console.log(`DB Connection Pool Status: Active Connections = ${rows[0].count}`);
  } catch (error) {
    console.error('Error querying connection pool status:', error);
  }
}, 300000); // 300,000 milliseconds = 5 minutes

module.exports = db;
