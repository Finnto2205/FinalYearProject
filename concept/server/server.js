const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/database');

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
