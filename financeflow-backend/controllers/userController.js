// controllers/userController.js
const db = require('../config/dbConfig');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// User registration
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = 'INSERT INTO Users (name, email, password) VALUES (?, ?, ?)';
    db.execute(query, [name, email, hashedPassword], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'User registered successfully' });
    });
};

// User login
const loginUser = (req, res) => {
    const { email, password } = req.body;

    db.execute('SELECT * FROM Users WHERE email = ?', [email], async (err, results) => {
        if (err || results.length === 0) return res.status(400).json({ error: 'Invalid email or password' });

        const user = results[0];
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) return res.status(401).json({ error: 'Invalid email or password' });

        const token = jwt.sign({ userID: user.userID }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    });
};

module.exports = { registerUser, loginUser };
