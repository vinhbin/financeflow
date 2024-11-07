// config/config.js
require('dotenv').config();

const requiredEnvVars = [
  'OPENAI_API_KEY',
  'PLAID_ENV',
  'PLAID_CLIENT_ID',
  'PLAID_SECRET',
  'JWT_SECRET',
  'DB_HOST',
  'MYSQL_USER',
  'MYSQL_PASSWORD',
  'MYSQL_DATABASE',
  // Add other database env variables if required
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`Error: Missing environment variable ${varName}`);
    process.exit(1);
  }
});

module.exports = {
  openaiApiKey: process.env.OPENAI_API_KEY,
  plaidEnv: process.env.PLAID_ENV,
  plaidClientId: process.env.PLAID_CLIENT_ID,
  plaidSecret: process.env.PLAID_SECRET,
  jwtSecret: process.env.JWT_SECRET,
  port: process.env.PORT || 5005,
  MYSQLHost: process.env.DB_HOST, // Assuming DB_HOST is the MySQL host
  MYSQLUser: process.env.MYSQL_USER,
  MYSQLPassword: process.env.MYSQL_PASSWORD,
  MYSQLDatabase: process.env.MYSQL_DATABASE,
  // include other variables as needed
};
