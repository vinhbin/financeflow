// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const plaidRoutes = require('./routes/plaidRoutes');
const aiInsightRoutes = require('./routes/aiInsightRoutes');  // Add AI Insight route

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/plaid', plaidRoutes);
app.use('/api/ai-insights', aiInsightRoutes);  // Register AI Insights route

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
