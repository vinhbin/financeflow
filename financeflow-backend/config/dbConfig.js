// Import MySQL library
const mysql = require('mysql2');
require('dotenv').config();  // Load environment variables from .env file

// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,         // Host where your MySQL is running (usually 'localhost')
  user: process.env.MYSQL_USER,         // MySQL username
  password: process.env.MYSQL_PASSWORD, // MySQL password
  database: process.env.MYSQL_DATABASE  // The database name (e.g., financeflow)
});

// Establish the connection
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database');
});

// Export the connection for use in your controllers
module.exports = connection;
