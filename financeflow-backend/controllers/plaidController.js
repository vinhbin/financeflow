const { PlaidApi } = require("plaid");
const plaid = require('plaid');
const app = express();
app.use(express.json());

const client = new PlaidApi.client({
    clientID: process.env.PLAID_CLIENT_ID,
    secret: process.env.PLAID_SECRET,
    env: plaid.environments.sandbox
});



// Create Plaid link token
//Define createLinkToken function:
    //Extract userID from the request body
    //Call Plaid API to create a link token with userID, client name, and product type (transactions)
    //If successful:
        //Return the link token to the frontend
    //If there's an error:
        //Return error message (e.g., "Failed to create link token")

async function createLinkToken(req, res) {
    try {
        const userID = req.body;

        //Creates link token
        const response = await client.linkTokenCreation({
            user: {
                client_user_id: userID
            },
            
            client_name: 'FinanceFlow',
            product: ['transactions'],
            country: ['US'],
            language: 'en'
        });
        //Returns link token to frontend
        return res.status(200).json({
            success: true,
            linkToken: response.link_token
        });
    } catch (error) {
        //Returns an error 
        return res.status(500).json({
            success: false,
            message: 'Failed to create link token',
            error: error.message
        });
    }
}

// Exchange Plaid public token for access token
/*Define exchangePublicToken function:
    Extract public token and userID from the request body
    Call Plaid API to exchange the public token for an access token
    Store the access token and itemID in the database for future use
    If successful:
        Return success message with the access token
    If there's an error:
        Return error message (e.g., "Failed to exchange public token")*/

async function exchangePublicToken(req, res) {
    try {
        const {publicToken, userID} = req.body;

        //Exchange public token and access token
        const response = await client.itemPublicTokenExchange({
            public_token: publicToken
        });

        const accessToken = response.access_token;
        const itemID = response.item_id;

        await saveAccessToken(userID, accessToken, itemID);

        return res.status(200).json({
            success: true,
            accessToken: accessToken
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to exchange public token',
            error: error.message
        });
    }   
}

async function saveAccessToken(userID, accessToken, itemID) {
    console.log('Storing access token');
    //Replace with database logic
}

// Fetch transactions from Plaid
/*Define getTransactions function:
    Extract userID from the request parameters
    Query the database to get the stored access token for the user
    Call Plaid API to retrieve transactions using the access token
    If successful:
        Return the list of transactions to the frontend
    If there's an error:
        Return error message (e.g., "Failed to retrieve transactions")

*/
async function getTransactions(req,res) {
    try {
        const {userID} = req.params;
        
        //Requesting the stored access token
        const accessToken = await getAccessToken(userID);

        if (!accessToken) {
            return res.status(404).json({
                success: false,
                message: 'Access token not found for user'
            });
        }

        //Call Plaid to get transactions
        const response = await client.transactionsGet({
            access_token: accessToken,
            start_date: 'Placeholder',//Replace with actual date
            end_date: 'Placeholder'//Replace with actual date
        });

        const transactions = response.transactions;

        return res.status(200).json({
            success: true,
            transactions: transactions
        });
    
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve transactions',
            error: error.message
        });
    }
}

async function getAccessToken(userID) {
    console.log('Retrieving access token')
    return 'fake access token' //Replace with real access token
}

//Route for creating a link token
app.post('/createLinkToken', createLinkToken);

//Route for token exchange
app.post('/exchangePublicToken', exchangePublicToken);

//Retreiving transactions
app.get('/getTransactions/:userID', getTransactions);