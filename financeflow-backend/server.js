// Import express and other necessary packages
Import express
Import bodyParser
Import cors
Import dotenv

// Import all route files
Import userRoutes from './routes/userRoutes'
Import expenseRoutes from './routes/expenseRoutes'
Import plaidRoutes from './routes/plaidRoutes'
Import aiInsightRoutes from './routes/aiInsightRoutes'
Import categoryRoutes from './routes/categoryRoutes'
Import notificationRoutes from './routes/notificationRoutes'

// Initialize the express app
const app = express()

// Middleware to handle JSON and cross-origin requests
app.use(bodyParser.json())
app.use(cors())

// Link the API routes
app.use('/api/users', userRoutes)  // User routes for registration and login
app.use('/api/expenses', expenseRoutes)  // Expense routes for managing expenses
app.use('/api/plaid', plaidRoutes)  // Plaid routes for bank account linking and transactions
app.use('/api/ai-insights', aiInsightRoutes)  // AI insights route
app.use('/api/categories', categoryRoutes)  // Category routes
app.use('/api/notifications', notificationRoutes)  // Notification routes

// Start the server on a specific port (e.g., 5000)
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
