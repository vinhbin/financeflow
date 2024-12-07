// controllers/userController.js
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/asyncHandler');
const sendEmail = require('../utils/sendEmail'); // Adjust path if necessary
const logger = require('../utils/logger'); // Import logger if using

const db = require('../config/dbConfig'); // Ensure correct path

// User Registration
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    logger.error('All fields are required for registration');
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if user already exists
    const checkQuery = 'SELECT * FROM Users WHERE email = ?';
    const [existingUserRows] = await db.execute(checkQuery, [email]);

    if (!Array.isArray(existingUserRows)) {
      logger.error('Unexpected result format:', existingUserRows);
      return res.status(500).json({ error: 'Database query error' });
    }

    if (existingUserRows.length > 0) {
      logger.warn(`User already exists with email: ${email}`);
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    const insertQuery = 'INSERT INTO Users (name, email, password) VALUES (?, ?, ?)';
    const [insertResult] = await db.execute(insertQuery, [name, email, hashedPassword]);

    if (!insertResult || !insertResult.insertId) {
      logger.error('Unexpected insert result format:', insertResult);
      return res.status(500).json({ error: 'Failed to register user' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: insertResult.insertId }, process.env.JWT_SECRET, { expiresIn: '1h' });

    logger.info(`User registered successfully with email: ${email}`);
    res.status(201).json({ token, userID: insertResult.insertId });
  } catch (error) {
    logger.error('Error during registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User Login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    // Fetch user from the database
    const [rows] = await db.execute('SELECT userID, name, email, password FROM Users WHERE email = ?', [email]);

    if (rows.length === 0) {
      logger.warn(`Invalid login attempt with email: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      logger.warn(`Invalid password attempt for email: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userID: user.userID, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    logger.info(`User logged in successfully with email: ${email}`);
    res.status(200).json({ token, userID: user.userID, name: user.name });
  } catch (error) {
    logger.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Request Password Reset
const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    logger.error('No email provided in password reset request');
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Check if user exists
    const [users] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
    const user = users[0];

    if (!user) {
      logger.warn(`Password reset requested for non-existent email: ${email}`);
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a unique reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    logger.info(`Generated resetToken: ${resetToken} for email: ${email}`);
    const hashedToken = await bcrypt.hash(resetToken, 10);
    logger.info(`Hashed resetToken for email: ${email}`);

    // Set resetTokenExpiry in UTC
    const expiryDuration = '1 hour'; // You can adjust this as needed
    const resetTokenExpiry = new Date(Date.now() + 3600000).toISOString().slice(0, 19).replace('T', ' ');
    logger.info(`resetTokenExpiry (UTC): ${resetTokenExpiry} for email: ${email}`);

    // Update user with reset token and expiry
    await db.query(
      'UPDATE Users SET resetToken = ?, resetTokenExpiry = ? WHERE email = ?',
      [hashedToken, resetTokenExpiry, email]
    );
    logger.info(`Updated user ${email} with resetToken and resetTokenExpiry`);

    // Create reset link using FRONTEND_BASE_URL
    const resetLink = `${process.env.FRONTEND_BASE_URL}/reset-password/${resetToken}`;
    logger.info(`Reset link: ${resetLink} for email: ${email}`);

    // Format the request time in a readable format
    const requestTime = new Date().toLocaleString('en-US', { timeZone: 'UTC', hour12: true });

    // Email content data
    const context = {
      name: user.name, // Ensure 'name' exists in the Users table
      resetLink,
      currentYear: new Date().getFullYear(),
      requestTime,        // New field
      expiryDuration,     // New field
    };

    // Send the email using the 'resetPassword' template
    await sendEmail(email, 'Password Reset Request', 'resetPassword', context);
    logger.info(`Password reset email sent to ${email}`);

    res.json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    logger.error('Error in requestPasswordReset:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!token || !newPassword) {
    logger.error('Token or newPassword not provided in resetPassword request');
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  logger.info(`Received token: ${token}`);

  try {
    // Log server time in UTC
    const serverTime = new Date().toISOString();
    logger.info(`Server Time (UTC): ${serverTime}`);

    // Retrieve current database UTC time
    const [nowResult] = await db.query('SELECT UTC_TIMESTAMP() as now');
    logger.info(`Database UTC_NOW(): ${nowResult[0].now}`);

    // Retrieve users with valid reset tokens
    const [users] = await db.query('SELECT * FROM Users WHERE resetTokenExpiry > UTC_TIMESTAMP()');
    logger.info(`Users with valid reset tokens: ${users.length}`);

    // Log resetTokenExpiry for each user
    users.forEach(u => {
      logger.info(`UserID: ${u.userID}, resetTokenExpiry (UTC): ${u.resetTokenExpiry}`);
    });

    // Find the user with the matching reset token
    let user = null;
    for (const u of users) {
      const isMatch = await bcrypt.compare(token, u.resetToken);
      logger.info(`Comparing token with userID ${u.userID}: ${isMatch}`);
      if (isMatch) {
        user = u;
        break;
      }
    }

    if (!user) {
      logger.warn('No matching user found for the provided token');
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    logger.info(`User found for token: userID ${user.userID}`);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    logger.info(`Hashed new password for userID ${user.userID}`);

    // Update the user's password and remove resetToken fields
    await db.query(
      'UPDATE Users SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE userID = ?',
      [hashedPassword, user.userID]
    );
    logger.info(`Password updated for userID ${user.userID}`);

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    logger.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify Reset Token
const verifyResetToken = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    logger.error('No token provided in verifyResetToken request');
    return res.status(400).json({ valid: false, message: 'Token is required' });
  }

  try {
    // Retrieve users with valid reset tokens
    const [users] = await db.query('SELECT * FROM Users WHERE resetTokenExpiry > UTC_TIMESTAMP()');
    logger.info(`Users with valid reset tokens: ${users.length}`);

    for (const user of users) {
      const isMatch = await bcrypt.compare(token, user.resetToken);
      logger.info(`Comparing token with userID ${user.userID}: ${isMatch}`);
      if (isMatch) {
        logger.info(`Token is valid for userID ${user.userID}`);
        return res.json({ valid: true });
      }
    }

    logger.warn('Invalid or expired token attempted');
    return res.status(400).json({ valid: false, message: 'Invalid or expired token' });
  } catch (error) {
    logger.error('Error in verifyResetToken:', error);
    res.status(500).json({ valid: false, message: 'Server error' });
  }
});

module.exports = {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
  verifyResetToken, // Ensure this is exported
};
