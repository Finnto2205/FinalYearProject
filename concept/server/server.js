const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const mysql = require('mysql2/promise');

const authRoutes = require('./routes/auth');
const scheduleRoutes = require('./routes/schedule');
const timeOffRoutes = require('./routes/timeOff');
const userRoutes = require('./routes/users');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/timeoff', timeOffRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

async function ensureAvailableShiftsColumn(conn) {
  const [rows] = await conn.execute(
    "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'rota_management' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'available_shifts'"
  );

  if (rows.length === 0) {
    console.log('Adding missing available_shifts column to users table');
    await conn.execute(
      "ALTER TABLE users ADD COLUMN available_shifts JSON"
    );
  }
}

async function runSetup() {
  const sql = fs.readFileSync(__dirname + '/setup.sql', 'utf8');
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password',
    multipleStatements: true
  });
  try {
    await conn.query(sql);
  } catch (err) {
    if (err.code === 'ER_PARSE_ERROR') {
      const stmts = sql
        .split(/;\s*\n/)
        .map(s => s.trim())
        .filter(Boolean);
      for (const stmt of stmts) {
        await conn.query(stmt);
      }
    } else if (err.errno === 1265 /* data truncated for enum */) {
      console.warn('setup.sql produced truncation warning, continuing');
    } else {
      throw err;
    }
  }

  try {
    await ensureAvailableShiftsColumn(conn);
  } catch (err) {
    console.error('Could not ensure available_shifts column exists:', err);
  }

  const defaultStaff = [
    ['staff', 'user123', 'Regular User', 'Alice Johnson'],
    ['bob', 'bob123', 'Bob User', 'Bob Smith'],
    ['carol', 'carol123', 'Carol User', 'Carol White'],
    ['david', 'david123', 'David User', 'David Brown'],
    ['emma', 'emma123', 'Emma User', 'Emma Davis'],
    ['frank', 'frank123', 'Frank User', 'Frank Miller'],
    ['george', 'george123', 'George User', 'George King'],
    ['helen', 'helen123', 'Helen User', 'Helen Lee'],
    ['ian', 'ian123', 'Ian User', 'Ian Clark'],
    ['jane', 'jane123', 'Jane User', 'Jane Adams']
  ];

  for (const [username, password, fullName, employeeName] of defaultStaff) {
    try {
      await conn.execute(
        'INSERT INTO users (username,password,full_name,employee_name,role,available_shifts) VALUES (?, ?, ?, ?, ?, ?)',
        [username, password, fullName, employeeName, 'staff', JSON.stringify(['Morning', 'Afternoon', 'Evening'])]
      );
    } catch (err) {
      if (err.code !== 'ER_DUP_ENTRY') {
        console.error('Error seeding staff user', username, err);
      }
    }
  }

  try {
    await conn.execute("UPDATE users SET role='staff' WHERE role <> 'admin'");
  } catch (err) {
    console.error('Error normalizing user roles', err);
  }

  await conn.end();
}
runSetup().catch(console.error);
