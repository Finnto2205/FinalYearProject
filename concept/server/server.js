const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/database');
const fs = require('fs');
const mysql = require('mysql2/promise');

const authRoutes = require('./routes/auth');
const scheduleRoutes = require('./routes/schedule');
const timeOffRoutes = require('./routes/timeOff');

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
  console.log('MySQL connection pool created');
});

async function runSetup() {
  const sql = fs.readFileSync(__dirname + '/setup.sql', 'utf8');
  // mysql2 will reject multi‑statement strings by default. we only need this
  // during development, so enable the option here.
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password',
    multipleStatements: true
  });
  try {
    await conn.query(sql);
  } catch (err) {
    // if multiStatements still fails (older server) split on semicolon
    if (err.code === 'ER_PARSE_ERROR') {
      const stmts = sql
        .split(/;\s*\n/)
        .map(s => s.trim())
        .filter(Boolean);
      for (const stmt of stmts) {
        await conn.query(stmt);
      }
    } else if (err.errno === 1265 /* data truncated for enum */) {
      // ignore harmless enum/truncation warnings from seed data
      console.warn('setup.sql produced truncation warning, continuing');
    } else {
      throw err;
    }
  }

  // ensure default staff members exist – avoids needing a separate seed script
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
        'INSERT INTO users (username,password,full_name,employee_name,role) VALUES (?, ?, ?, ?, ?)',
        [username, password, fullName, employeeName, 'staff']
      );
    } catch (err) {
      // ignore duplicate entry which means row already exists
      if (err.code !== 'ER_DUP_ENTRY') {
        console.error('Error seeding staff user', username, err);
      }
    }
  }

  // correct any legacy/malformed role values (empty or 'user') to 'staff'
  try {
    await conn.execute("UPDATE users SET role='staff' WHERE role <> 'admin'");
  } catch (err) {
    console.error('Error normalizing user roles', err);
  }

  await conn.end();
}
runSetup().catch(console.error);
