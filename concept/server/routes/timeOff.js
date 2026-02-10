const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all time off requests
router.get('/requests', async (req, res) => {
  try {
    const connection = await db.getConnection();

    const [requests] = await connection.execute(
      `SELECT id, employee_name as employee, start_date as startDate, 
              end_date as endDate, type, reason, status, 
              created_at as requestedDate FROM time_off_requests 
       ORDER BY created_at DESC`
    );

    connection.release();

    // Format dates properly
    const formattedRequests = requests.map(req => ({
      ...req,
      startDate: req.startDate.toISOString().split('T')[0],
      endDate: req.endDate.toISOString().split('T')[0],
      requestedDate: req.requestedDate.toISOString().split('T')[0]
    }));

    res.json(formattedRequests);
  } catch (error) {
    console.error('Error fetching time off requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests', message: error.message });
  }
});

// Get time off requests for a specific employee
router.get('/requests/:employeeName', async (req, res) => {
  try {
    const { employeeName } = req.params;
    const connection = await db.getConnection();

    const [requests] = await connection.execute(
      `SELECT id, employee_name as employee, start_date as startDate, 
              end_date as endDate, type, reason, status, 
              created_at as requestedDate FROM time_off_requests 
       WHERE employee_name = ? ORDER BY created_at DESC`,
      [employeeName]
    );

    connection.release();

    const formattedRequests = requests.map(req => ({
      ...req,
      startDate: req.startDate.toISOString().split('T')[0],
      endDate: req.endDate.toISOString().split('T')[0],
      requestedDate: req.requestedDate.toISOString().split('T')[0]
    }));

    res.json(formattedRequests);
  } catch (error) {
    console.error('Error fetching time off requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests', message: error.message });
  }
});

// Create a new time off request
router.post('/request', async (req, res) => {
  try {
    const { employeeName, startDate, endDate, type, reason } = req.body;

    if (!employeeName || !startDate || !endDate || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const connection = await db.getConnection();

    const [result] = await connection.execute(
      `INSERT INTO time_off_requests 
       (employee_name, start_date, end_date, type, reason, status, created_at) 
       VALUES (?, ?, ?, ?, ?, 'pending', NOW())`,
      [employeeName, startDate, endDate, type, reason || null]
    );

    connection.release();

    res.json({ success: true, id: result.insertId, message: 'Request created successfully' });
  } catch (error) {
    console.error('Error creating time off request:', error);
    res.status(500).json({ error: 'Failed to create request', message: error.message });
  }
});

// Approve a time off request
router.post('/approve/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await db.getConnection();

    await connection.execute(
      'UPDATE time_off_requests SET status = ? WHERE id = ?',
      ['approved', id]
    );

    connection.release();

    res.json({ success: true, message: 'Request approved' });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ error: 'Failed to approve request', message: error.message });
  }
});

// Deny a time off request
router.post('/deny/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await db.getConnection();

    await connection.execute(
      'UPDATE time_off_requests SET status = ? WHERE id = ?',
      ['denied', id]
    );

    connection.release();

    res.json({ success: true, message: 'Request denied' });
  } catch (error) {
    console.error('Error denying request:', error);
    res.status(500).json({ error: 'Failed to deny request', message: error.message });
  }
});

module.exports = router;
