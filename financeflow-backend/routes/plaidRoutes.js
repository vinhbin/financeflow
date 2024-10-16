// Import express and plaidController
Import express and plaidController
Create router object

// Define routes for Plaid integration
POST '/api/plaid/link' -> Calls plaidController.createLinkToken  // Create Plaid link token
POST '/api/plaid/exchange' -> Calls plaidController.exchangePublicToken  // Exchange Plaid public token for access token
GET '/api/plaid/transactions/:userID' -> Calls plaidController.getTransactions  // Fetch transactions for a user

// Export the router
Export router
