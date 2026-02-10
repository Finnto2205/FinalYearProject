const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get schedule for a specific week
router.get('/week/:week', async (req, res) => {
  try {
    const { week } = req.params;
    const connection = await db.getConnection();

    const [schedules] = await connection.execute(
      'SELECT * FROM schedules WHERE week = ?',
      [week]
    );

    connection.release();

    // Transform database format to frontend format
    const scheduleData = {};
    schedules.forEach(schedule => {
      if (!scheduleData[schedule.day]) {
        scheduleData[schedule.day] = {};
      }
      if (!scheduleData[schedule.day][schedule.shift]) {
        scheduleData[schedule.day][schedule.shift] = [];
      }
      scheduleData[schedule.day][schedule.shift].push(schedule.employee_name);
    });

    res.json(scheduleData);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Failed to fetch schedule', message: error.message });
  }
});

// Update schedule (assign/unassign employee from shift)
router.post('/update', async (req, res) => {
  try {
    const { week, day, shift, employeeName, isAssigned } = req.body;

    if (isAssigned === undefined || week === undefined || !day || !shift || !employeeName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const connection = await db.getConnection();

    if (isAssigned) {
      // Remove employee from shift (isAssigned=true means they ARE assigned, so remove them)
      await connection.execute(
        'DELETE FROM schedules WHERE week = ? AND day = ? AND shift = ? AND employee_name = ?',
        [parseInt(week), day, shift, employeeName]
      );
    } else {
      // Add employee to shift (isAssigned=false means they're NOT assigned, so add them)
      try {
        await connection.execute(
          'INSERT INTO schedules (week, day, shift, employee_name) VALUES (?, ?, ?, ?)',
          [parseInt(week), day, shift, employeeName]
        );
      } catch (insertError) {
        // If duplicate entry, just ignore (already assigned)
        if (insertError.code === 'ER_DUP_ENTRY') {
          connection.release();
          return res.json({ success: true, message: 'Employee already assigned to this shift' });
        }
        throw insertError;
      }
    }

    connection.release();

    res.json({ success: true, message: 'Schedule updated successfully' });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ error: 'Failed to update schedule', message: error.message });
  }
});

// Get all employees
router.get('/employees', async (req, res) => {
  try {
    const connection = await db.getConnection();

    const [employees] = await connection.execute(
      'SELECT id, employee_name FROM users WHERE role = ?',
      ['user']
    );

    connection.release();

    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees', message: error.message });
  }
});

module.exports = router;
