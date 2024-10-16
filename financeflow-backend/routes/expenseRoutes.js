// Import express and expenseController
Import express and expenseController
Create router object

// Define routes for managing expenses
POST '/api/expenses/create' -> Calls expenseController.addExpense  // Add a new expense
PUT '/api/expenses/edit/:expenseID' -> Calls expenseController.editExpense  // Edit an existing expense
DELETE '/api/expenses/delete/:expenseID' -> Calls expenseController.deleteExpense  // Delete an expense
GET '/api/expenses/user/:userID' -> Calls expenseController.getUserExpenses  // Get all expenses for a user

// Export the router
Export router
