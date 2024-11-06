// middleware/authenticate.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');

const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Attach user info to request
      next();
    } catch (error) {
      console.error('Invalid token:', error);
      res.status(401).json({ message: 'Invalid token' });
    }
  } else {
    res.status(401).json({ message: 'Authorization header missing or malformed' });
  }
});

module.exports = authenticate;
