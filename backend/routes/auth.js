const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../database');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const admin = db.prepare('SELECT * FROM admin WHERE username = ?').get(username);

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const validPassword = bcrypt.compareSync(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, message: 'Login successful.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// GET /api/auth/verify
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, admin: { id: decoded.id, username: decoded.username } });
  } catch (err) {
    res.status(401).json({ valid: false });
  }
});

module.exports = router;
