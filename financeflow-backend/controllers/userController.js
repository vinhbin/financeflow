// Register a new user
Define registerUser function:
    Extract name, email, and password from the request body
    Hash the password using bcrypt
    Insert the new user (name, email, hashedPassword) into the database
    If the insertion is successful:
        Return success message (e.g., "User registered successfully")
    If there is an error:
        Return error message (e.g., "User registration failed")

// Log in an existing user
Define loginUser function:
    Extract email and password from the request body
    Query the database to find the user by email
    If user is found:
        Compare the hashed password with the provided password
        If passwords match:
            Generate JWT token for authentication
            Return the JWT token to the frontend
        If passwords don't match:
            Return error message (e.g., "Invalid credentials")
    If user is not found:
        Return error message (e.g., "User not found")
