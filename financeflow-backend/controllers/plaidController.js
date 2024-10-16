// Create Plaid link token
Define createLinkToken function:
    Extract userID from the request body
    Call Plaid API to create a link token with userID, client name, and product type (transactions)
    If successful:
        Return the link token to the frontend
    If there's an error:
        Return error message (e.g., "Failed to create link token")

// Exchange Plaid public token for access token
Define exchangePublicToken function:
    Extract public token and userID from the request body
    Call Plaid API to exchange the public token for an access token
    Store the access token and itemID in the database for future use
    If successful:
        Return success message with the access token
    If there's an error:
        Return error message (e.g., "Failed to exchange public token")

// Fetch transactions from Plaid
Define getTransactions function:
    Extract userID from the request parameters
    Query the database to get the stored access token for the user
    Call Plaid API to retrieve transactions using the access token
    If successful:
        Return the list of transactions to the frontend
    If there's an error:
        Return error message (e.g., "Failed to retrieve transactions")
