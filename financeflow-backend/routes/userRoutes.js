// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, requestPasswordReset, resetPassword, verifyResetToken } = require('../controllers/userController');  // Ensure these are correctly imported
const resetPasswordLimiter = require('../middleware/rateLimiter');

// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);

// Password Reset Routes with Rate Limiting
router.post('/request-reset', resetPasswordLimiter, requestPasswordReset);
router.post('/reset-password/:token', resetPasswordLimiter, resetPassword);

// New route for verifying reset token
router.get('/verify-reset-token/:token', verifyResetToken);

module.exports = router;
