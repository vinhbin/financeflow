//server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

// Import routes
const userRoutes = require('./routes/userRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const plaidRoutes = require('./routes/plaidRoutes');
const aiInsightRoutes = require('./routes/aiInsightRoutes');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/plaid', plaidRoutes);
app.use('/api/ai-insights', aiInsightRoutes);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend server is operational!' });
});