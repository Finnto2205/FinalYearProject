const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Get all users for admin user management
router.get('/', async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [users] = await connection.execute(
      'SELECT id, username, full_name AS fullName, employee_name AS employeeName, role, available_shifts, created_at AS createdAt FROM users ORDER BY createdAt DESC'
    );
    connection.release();

    const parsedUsers = users.map((user) => ({
      ...user,
      available_shifts: typeof user.available_shifts === 'string'
        ? JSON.parse(user.available_shifts)
        : user.available_shifts || ['Morning', 'Afternoon', 'Evening']
    }));

    res.json(parsedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users', message: error.message });
  }
});

// Create a new user
router.post('/', async (req, res) => {
  try {
    const { username, password, fullName, employeeName, role, availableShifts } = req.body;

    if (!username || !password || !fullName || !employeeName || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const connection = await db.getConnection();
    const shifts = Array.isArray(availableShifts) && availableShifts.length > 0
      ? availableShifts
      : ['Morning', 'Afternoon', 'Evening'];

    const [result] = await connection.execute(
      'INSERT INTO users (username, password, full_name, employee_name, role, available_shifts) VALUES (?, ?, ?, ?, ?, ?)',
      [username, hashedPassword, fullName, employeeName, role, JSON.stringify(shifts)]
    );

    connection.release();

    res.status(201).json({ success: true, id: result.insertId, message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Failed to create user', message: error.message });
  }
});

// Update an existing user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, fullName, employeeName, role, availableShifts } = req.body;

    if (!username || !fullName || !employeeName || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const connection = await db.getConnection();
    const fields = [username, fullName, employeeName, role];
    let query = 'UPDATE users SET username = ?, full_name = ?, employee_name = ?, role = ?';

    if (Array.isArray(availableShifts)) {
      query += ', available_shifts = ?';
      fields.push(JSON.stringify(availableShifts.length > 0 ? availableShifts : ['Morning', 'Afternoon', 'Evening']));
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = ?';
      fields.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    fields.push(id);

    await connection.execute(query, fields);
    connection.release();

    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Failed to update user', message: error.message });
  }
});

// Delete a user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await db.getConnection();

    await connection.execute('DELETE FROM users WHERE id = ?', [id]);
    connection.release();

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user', message: error.message });
  }
});

module.exports = router;
