// routes/notificationRoutes.js
const router = require('express').Router();

// Import the controller functions
const { sendNotification, getUserNotifications } = require('../controllers/notificationController');

// Route to send a notification
router.post('/send', sendNotification);

// Route to get notifications for a user
router.get('/user/:userID', getUserNotifications);

module.exports = router;
