# Project Structure

```
concept/
│
├── Frontend (React Application)
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── robots.txt
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js [MODIFIED]
│   │   │   ├── Login.css
│   │   │   ├── ScheduleView.js
│   │   │   ├── ScheduleView.css
│   │   │   ├── TimeOffManagement.js
│   │   │   └── TimeOffManagement.css
│   │   │
│   │   ├── App.js [MODIFIED]
│   │   ├── App.css
│   │   ├── App.test.js
│   │   ├── index.js
│   │   ├── index.css
│   │   ├── reportWebVitals.js
│   │   └── setupTests.js
│   │
│   ├── package.json [MODIFIED]
│   └── .gitignore
│
├── Backend (Express Application) [NEW]
│   ├── server.js [NEW]
│   │   - Express app initialization
│   │   - Middleware setup
│   │   - Route configuration
│   │   - Error handling
│   │
│   ├── package.json [NEW]
│   │   - Express, MySQL2, CORS dependencies
│   │   - npm scripts for dev/production
│   │
│   ├── config/ [NEW]
│   │   └── database.js
│   │       - MySQL connection pool
│   │       - Connection testing
│   │
│   ├── routes/ [NEW]
│   │   ├── auth.js
│   │   │   - POST /api/auth/login
│   │   │
│   │   ├── schedule.js
│   │   │   - GET /api/schedule/week/:week
│   │   │   - POST /api/schedule/update
│   │   │   - GET /api/schedule/employees
│   │   │
│   │   └── timeOff.js
│   │       - GET /api/timeoff/requests
│   │       - GET /api/timeoff/requests/:employeeName
│   │       - POST /api/timeoff/request
│   │       - POST /api/timeoff/approve/:id
│   │       - POST /api/timeoff/deny/:id
│   │
│   └── setup.sql [NEW]
│       - Database and table creation
│       - Sample data seed
│
├── Documentation [NEW]
│   ├── SETUP_GUIDE.md
│   │   - Complete setup instructions
│   │   - Prerequisites and installation
│   │   - Configuration guide
│   │   - Troubleshooting
│   │
│   ├── CONVERSION_SUMMARY.md
│   │   - High-level overview
│   │   - Architecture comparison
│   │   - Quick start guide
│   │
│   ├── CONVERSION_REPORT.md
│   │   - Detailed conversion report
│   │   - File-by-file changes
│   │   - Database schema
│   │   - Testing checklist
│   │
│   ├── API_REFERENCE.md
│   │   - Complete API documentation
│   │   - Endpoint details with examples
│   │   - Request/response formats
│   │   - Error handling
│   │
│   ├── server/README.md
│   │   - Backend-specific setup
│   │   - Configuration instructions
│   │
│   ├── quickstart.bat
│   │   - Automated setup for Windows
│   │
│   └── quickstart.sh
│       - Automated setup for Mac/Linux
│
└── README.md (original)

```

## Directory Explanation

### Frontend (React)
Your existing React application remains mostly unchanged:
- Components handle UI and user interactions
- Now makes API calls to backend instead of using local state
- All styling and components intact

### Backend (Express) - NEW
New folder with the Express server:
- `server.js` - Main entry point
- `config/` - Database configuration
- `routes/` - API route handlers

### Database - NEW
MySQL database created with:
- `users` table for authentication
- `schedules` table for shift assignments
- `time_off_requests` table for time off management

### Documentation - NEW
Comprehensive guides for setup, API, and troubleshooting

## Running the Application

### Terminal 1 - Backend Server
```bash
cd server
npm install
npm run dev
# Server runs on http://localhost:5000
```

### Terminal 2 - Frontend Server
```bash
npm install
npm start
# Frontend opens at http://localhost:3000
```

## Key Files Modified

### src/App.js
- Changed from state-based to API-based
- Added async functions for API calls
- Integrated with Express backend

### src/components/Login.js
- Added loading state
- Made login async
- Shows "Logging in..." message

### package.json (root)
- Added proxy for development: `"proxy": "http://localhost:5000"`

## Key Files Created

### Backend
- `server/server.js` - Express app
- `server/package.json` - Dependencies
- `server/config/database.js` - MySQL config
- `server/routes/auth.js` - Auth endpoints
- `server/routes/schedule.js` - Schedule endpoints
- `server/routes/timeOff.js` - Time off endpoints
- `server/setup.sql` - Database schema

### Documentation
- `SETUP_GUIDE.md` - Installation guide
- `API_REFERENCE.md` - API documentation
- `CONVERSION_SUMMARY.md` - What changed
- `CONVERSION_REPORT.md` - Detailed report
- `quickstart.bat` - Windows setup
- `quickstart.sh` - Mac/Linux setup

## Total Changes

- **17 files created**
- **3 files modified**
- **0 files deleted**
