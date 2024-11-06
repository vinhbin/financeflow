// server.js
const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan'); // HTTP request logger
const dotenv = require('dotenv');
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
const authenticate = require('./middleware/authenticate'); // Authentication middleware

// Middleware Configuration
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev')); // Logs all incoming requests in the 'dev' format

// Routes Configuration
app.use('/api/users', userRoutes);
app.use('/api/expenses', authenticate, expenseRoutes);
app.use('/api/plaid', authenticate, plaidRoutes);
app.use('/api/ai-insights', authenticate, aiInsightsRoutes);
app.use('/api/categories', authenticate, categoryRoutes);
app.use('/api/notifications', authenticate, notificationRoutes);

// Handle Undefined Routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Centralized Error Handler
app.use(errorHandler);

// Start the Server
const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
