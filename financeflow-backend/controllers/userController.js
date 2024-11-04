const db = require('../config/dbConfig');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/asyncHandler');

// User registration function
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if user already exists
    const checkQuery = 'SELECT * FROM Users WHERE email = ?';
    const [existingUserRows] = await db.execute(checkQuery, [email]);

    if (!Array.isArray(existingUserRows)) {
      console.error('Unexpected result format:', existingUserRows);
      return res.status(500).json({ error: 'Database query error' });
    }

    if (existingUserRows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    const insertQuery = 'INSERT INTO Users (name, email, password) VALUES (?, ?, ?)';
    const [insertResult] = await db.execute(insertQuery, [name, email, hashedPassword]);

    if (!insertResult || !insertResult.insertId) {
      console.error('Unexpected insert result format:', insertResult);
      return res.status(500).json({ error: 'Failed to register user' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: insertResult.insertId }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token, userID: insertResult.insertId });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login function
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const query = 'SELECT * FROM Users WHERE email = ?';
    const [userRows] = await db.execute(query, [email]);

    if (!Array.isArray(userRows) || userRows.length === 0) {
      console.error('Unexpected users query result:', userRows);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userRows[0];

    // Verify password by comparing with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, userID: user.id });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = { loginUser, registerUser };
