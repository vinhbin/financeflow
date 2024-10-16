// Add a new expense
Define addExpense function:
    Extract userID, amount, category, and date from the request body
    Insert the expense into the Expenses table in the database
    If insertion is successful:
        Return success message (e.g., "Expense added successfully")
    If there's an error:
        Return error message (e.g., "Failed to add expense")

// Edit an existing expense
//Define editExpense function:
    Extract expenseID and updated data (amount, category, date) from the request body
    Update the corresponding expense in the database based on the expenseID
    If update is successful:
        Return success message (e.g., "Expense updated successfully")
    If there's an error:
        Return error message (e.g., "Failed to update expense")

// Delete an expense
Define deleteExpense function:
    Extract expenseID from the request parameters
    Delete the corresponding expense from the database
    If deletion is successful:
        Return success message (e.g., "Expense deleted successfully")
    If there's an error:
        Return error message (e.g., "Failed to delete expense")

// Get all expenses for a user
Define getUserExpenses function:
    Extract userID from the request parameters
    Query the database for all expenses associated with the userID
    If found:
        Return the list of expenses
    If there's an error:
        Return error message (e.g., "Failed to retrieve expenses")
