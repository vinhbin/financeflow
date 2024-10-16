// Create a notification
Define createNotification function:
    Extract userID, message, and type from the request body
    Insert the notification into the Notifications table
    If insertion is successful:
        Return success message (e.g., "Notification created successfully")
    If there's an error:
        Return error message (e.g., "Failed to create notification")

// Get notifications for a user
Define getUserNotifications function:
    Extract userID from the request parameters
    Query the database to get all notifications associated with the userID
    If successful:
        Return the notifications to the frontend
    If there's an error:
        Return error message (e.g., "Failed to retrieve notifications")
