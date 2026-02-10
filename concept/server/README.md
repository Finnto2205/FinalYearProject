# Backend Setup Instructions

## Prerequisites
- Node.js (v14+)
- MySQL Server running locally
- npm or yarn

## Step 1: Install MySQL Database

1. Open MySQL command line or MySQL Workbench
2. Run the following command to create the database and tables:
   ```
   mysql -u root -p < setup.sql
   ```
   (Enter your MySQL root password when prompted)

Alternatively, copy the entire content of `setup.sql` and execute it in MySQL Workbench or the MySQL CLI.

## Step 2: Configure Database Connection

Open `server/config/database.js` and update the connection settings if needed:
```javascript
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Add your MySQL password here if you have one
  database: 'rota_management',
  // ... rest of config
});
```

## Step 3: Install Dependencies

Navigate to the server folder and install dependencies:
```bash
cd server
npm install
```

## Step 4: Start the Server

Run the following command to start the Express server:
```bash
npm run dev
```

Or for production:
```bash
npm start
```

The server should run on `http://localhost:5000`

## Testing the Backend

You can test the API endpoints using Postman or curl:

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Get Schedule
```bash
curl http://localhost:5000/api/schedule/week/0
```

### Get Time Off Requests
```bash
curl http://localhost:5000/api/timeoff/requests
```

## Default Test Credentials

The database is pre-populated with test users:
- **Admin**: username: `admin`, password: `admin123`
- **User**: username: `user`, password: `user123`
- **Other Users**: bob, carol, david, emma (all with passwords: username + "123")

## Database Schema

### users
- id, username, password, full_name, employee_name, role, created_at

### schedules
- id, week, day, shift, employee_name, created_at

### time_off_requests
- id, employee_name, start_date, end_date, type, reason, status, created_at

## Frontend Connection

The React frontend is configured to connect to `http://localhost:5000/api`. Make sure:
1. The backend server is running
2. CORS is enabled (it is in the current setup)
3. The frontend is running on a different port (typically 3000)
