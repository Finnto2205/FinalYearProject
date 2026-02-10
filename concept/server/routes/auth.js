const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const connection = await db.getConnection();

    const [users] = await connection.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    connection.release();

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = users[0];

    // For demo purposes, also support plain text passwords
    const passwordMatch = password === user.password || await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        employeeName: user.employee_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
});

module.exports = router;
