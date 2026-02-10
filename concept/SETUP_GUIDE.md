# Rota Management System - Full Stack Setup Guide

This document provides step-by-step instructions for setting up and running the complete Rota Management System with Express backend and MySQL database.

## Architecture Overview

The application consists of:
- **Frontend**: React application (runs on port 3000)
- **Backend**: Express.js server (runs on port 5000)
- **Database**: MySQL (running locally)

## Prerequisites

Before starting, ensure you have installed:
1. **Node.js** - Download from https://nodejs.org/ (v14 or higher)
2. **MySQL Server** - Download from https://dev.mysql.com/downloads/mysql/
3. **Git** (optional, for version control)

## Step 1: Database Setup

### 1.1 Start MySQL Server
- On **Windows**: MySQL should start automatically, or search for "MySQL80" in Services and start it
- On **Mac**: Use Homebrew or start via System Preferences
- On **Linux**: `sudo systemctl start mysql` or `sudo /usr/local/mysql/support-files/mysql.server start`

### 1.2 Create Database and Tables

Navigate to the server folder and run the SQL setup script:

```bash
cd server
mysql -u root -p < setup.sql
```

When prompted, enter your MySQL root password (or press Enter if no password is set).

**What this does:**
- Creates the `rota_management` database
- Creates three tables: `users`, `schedules`, `time_off_requests`
- Inserts sample data for testing

### 1.3 Verify Database Connection (Optional)

Test your MySQL connection by logging in:
```bash
mysql -u root -p
```

Then run:
```sql
USE rota_management;
SHOW TABLES;
SELECT * FROM users;
EXIT;
```

## Step 2: Backend Setup

### 2.1 Navigate to Server Directory
```bash
cd server
```

### 2.2 Configure Database Connection (if needed)

Edit `server/config/database.js` and update the connection settings:
```javascript
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Add your MySQL password here
  database: 'rota_management',
  // ...
});
```

### 2.3 Install Backend Dependencies
```bash
npm install
```

This installs Express, MySQL driver, CORS, and other necessary packages.

### 2.4 Start the Backend Server

For development (with auto-reload):
```bash
npm run dev
```

For production:
```bash
npm start
```

You should see: `Server running on http://localhost:5000`

**Keep this terminal open** - the backend needs to stay running.

## Step 3: Frontend Setup

### 3.1 Open a New Terminal

Keep the backend running in the first terminal, open a **new terminal window**.

### 3.2 Navigate to Frontend Directory
```bash
cd <path-to-project>/concept
```

(The folder where this README is located)

### 3.3 Install Frontend Dependencies
```bash
npm install
```

### 3.4 Start the Frontend Server
```bash
npm start
```

The browser should automatically open to `http://localhost:3000`. If not, manually navigate there.

## Step 4: Test the Application

### 4.1 Login
The application now loads schedule and time off data from the MySQL database.

Use one of these test accounts:
- **Admin Account**
  - Username: `admin`
  - Password: `admin123`

- **Employee Account**
  - Username: `user`
  - Password: `user123`

- **Other Employees** (all with password as username + "123")
  - bob, carol, david, emma

### 4.2 Test Features

1. **View Schedule**: Log in as admin to see the full schedule or as a user to see personal schedule
2. **Edit Schedule** (Admin only): Click "Edit Schedule" to toggle employee assignments
3. **Request Time Off**: Use the "Request Time Off" tab to submit requests
4. **Manage Time Off** (Admin only): Approve or deny time off requests

### 4.3 Verify Database Updates

After performing actions (like requesting time off), verify the database was updated:

```bash
mysql -u root -p rota_management
SELECT * FROM time_off_requests;
SELECT * FROM schedules WHERE week = 0;
EXIT;
```

## Troubleshooting

### "Cannot connect to database" error

1. **Check if MySQL is running**:
   - Windows: Open Services and look for MySQL
   - Mac/Linux: Run `mysql -u root -p`

2. **Check credentials in `server/config/database.js`**:
   - Ensure username is correct (default: `root`)
   - Ensure password matches your MySQL root password

3. **Check database exists**:
   ```bash
   mysql -u root -p
   SHOW DATABASES;
   ```

### "Port 3000 or 5000 already in use"

Change the port in the relevant file:
- Frontend: Edit `.env` or modify the `start` script in `package.json`
- Backend: Edit `server.js` (change `const PORT = 5000`)

### "Module not found" error

Run `npm install` in the appropriate folder (frontend or server).

### CORS error in browser console

Ensure the backend is running on port 5000. Check that `API_URL` in `src/App.js` matches your backend URL.

## File Structure

```
concept/
├── src/
│   ├── App.js (modified to use API)
│   ├── components/
│   │   ├── Login.js (modified with loading state)
│   │   ├── ScheduleView.js
│   │   └── TimeOffManagement.js
│   └── ...other files
├── server/
│   ├── config/
│   │   └── database.js (MySQL connection)
│   ├── routes/
│   │   ├── auth.js (login endpoint)
│   │   ├── schedule.js (schedule endpoints)
│   │   └── timeOff.js (time off endpoints)
│   ├── server.js (Express app)
│   ├── package.json
│   ├── setup.sql (database schema)
│   └── README.md
└── package.json (frontend)
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username/password

### Schedule
- `GET /api/schedule/week/:week` - Get schedule for a week
- `POST /api/schedule/update` - Update schedule assignment
- `GET /api/schedule/employees` - Get all employees

### Time Off
- `GET /api/timeoff/requests` - Get all time off requests
- `GET /api/timeoff/requests/:employeeName` - Get requests for an employee
- `POST /api/timeoff/request` - Create new time off request
- `POST /api/timeoff/approve/:id` - Approve a request
- `POST /api/timeoff/deny/:id` - Deny a request

## Development Notes

- The frontend fetches data from the backend on login and updates are reflected in real-time
- The database persists all changes between sessions
- Schedule data is organized by week number (0 = first week, 1 = second week, etc.)
- Time off requests show "pending" until an admin approves or denies them

## Next Steps

1. **Add Authentication**: Implement JWT tokens for secure API access
2. **Add Validation**: Add server-side validation for all inputs
3. **Add Notifications**: Send email notifications for time off approvals
4. **Schedule Optimization**: Implement automatic scheduling algorithm
5. **Availability Tracking**: Add employee availability preferences
6. **Reporting**: Add analytics and reporting features

## Support

If you encounter issues:
1. Check the browser console (F12) for frontend errors
2. Check the terminal running the backend for server errors
3. Verify MySQL is running and the database is created
4. Ensure both Node.js and npm are installed correctly

Good luck with your Rota Management System!
