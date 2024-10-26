const db = require('../config/dbConfig');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User registration function
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // Check if all required fields are provided
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if user already exists
    const checkQuery = 'SELECT * FROM Users WHERE email = ?';
    db.execute(checkQuery, [email], async (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error' });

      if (results.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash the password using bcrypt
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert new user into the database
      const query = 'INSERT INTO Users (name, email, password) VALUES (?, ?, ?)';
      db.execute(query, [name, email, hashedPassword], (err, result) => {
        if (err) return res.status(500).json({ message: 'Server error' });

        // Generate JWT token for the new user
        const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ token, userID: result.insertId });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// User login function
const loginUser = (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  // Query to find user by email
  const query = 'SELECT * FROM Users WHERE email = ?';
  db.execute(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    // Check if user exists
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = results[0];

    // Compare passwords using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, 'mySuperSecretKey', { expiresIn: '1h' });


    res.json({ token, userID: user.id });
  });
};

module.exports = { loginUser, registerUser };
