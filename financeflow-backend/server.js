// server.js
const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan'); // HTTP request logger
const dotenv = require('dotenv');
const cron = require('node-cron');
const plaidController = require('./controllers/plaidController');
const config = require('./config/config'); // Importing config

dotenv.config();

// Import Routes
const userRoutes = require('./routes/userRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const plaidRoutes = require('./routes/plaidRoutes');
const aiInsightsRoutes = require('./routes/aiInsightRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Import Middleware
const errorHandler = require('./middleware/errorHandler'); // Centralized error handling

// Middleware Configuration
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev')); // Logs all incoming requests in the 'dev' format

// Routes Configuration
app.use('/api/users', userRoutes);
app.use('/api/plaid', plaidRoutes); // plaidRoutes already include authenticate middleware
app.use('/api/expenses', expenseRoutes); // expenseRoutes already include authenticate middleware
app.use('/api/ai-insights', aiInsightsRoutes); // aiInsightsRoutes already include authenticate middleware
app.use('/api/categories', categoryRoutes); // categoryRoutes already include authenticate middleware
app.use('/api/notifications', notificationRoutes); // notificationRoutes already include authenticate middleware

// Handle Undefined Routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Centralized Error Handler
app.use(errorHandler);

// Start the Server
const PORT = config.port || 5005;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Schedule the task to run daily at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily transaction update...');
  try {
    await plaidController.updateTransactions();
    console.log('Daily transaction update completed.');
  } catch (error) {
    console.error('Error during daily transaction update:', error);
  }
});
