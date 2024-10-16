// Import express and notificationController
Import express and notificationController
Create router object

// Define routes for notifications
POST '/api/notifications/create' -> Calls notificationController.createNotification  // Create a new notification
GET '/api/notifications/user/:userID' -> Calls notificationController.getUserNotifications  // Get notifications for a user

// Export the router
Export router
