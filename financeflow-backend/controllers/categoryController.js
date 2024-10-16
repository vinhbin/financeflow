// Add a new category
Define addCategory function:
    Extract category name from the request body
    Insert the category into the Categories table in the database
    If insertion is successful:
        Return success message (e.g., "Category added successfully")
    If there's an error:
        Return error message (e.g., "Failed to add category")

// Get all categories
Define getCategories function:
    Query the database for all expense categories
    If successful:
        Return the list of categories to the frontend
    If there's an error:
        Return error message (e.g., "Failed to retrieve categories")
