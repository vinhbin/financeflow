// controllers/notificationController.js
const asyncHandler = require('../middleware/asyncHandler');
const db = require('../config/dbConfig');

// Send Notification
const sendNotification = asyncHandler(async (req, res) => {
  const { userID, message } = req.body;

  if (!userID || !message) {
    return res.status(400).json({ error: 'userID and message are required' });
  }

  try {
    const query = 'INSERT INTO Notifications (userID, message, status) VALUES (?, ?, ?)';
    await db.execute(query, [userID, message, 'unread']);
    res.status(201).json({ message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Server error sending notification' });
  }
});

// Get User Notifications
const getUserNotifications = asyncHandler(async (req, res) => {
  const { userID } = req.params;
  if (!userID) {
    return res.status(400).json({ error: 'userID is required' });
  }

  try {
    const query = 'SELECT * FROM Notifications WHERE userID = ? ORDER BY timestamp DESC';
    const [notifications] = await db.execute(query, [userID]);

    if (!notifications.length) {
      return res.status(200).json({ message: 'No notifications found for this user.' });
    }

    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Server error fetching notifications' });
  }
});

module.exports = { sendNotification, getUserNotifications };
