require('dotenv').config();

const requiredEnvVars = [
  'OPENAI_API_KEY',
  'PLAID_ENV',
  'PLAID_CLIENT_ID',
  'PLAID_SECRET',
  'JWT_SECRET',
  'DB_HOST', // add other database env variables if required
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
  port: process.env.PORT || 5007,
  MYSQLHost: process.env.MYSQL_HOST,
  // include other variables as needed
};
