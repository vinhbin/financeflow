// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// Define rate limiter for password reset requests
const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many password reset attempts from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = resetPasswordLimiter;
