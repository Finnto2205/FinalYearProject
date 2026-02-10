# Rota Management System - Full Stack Application

A modern web-based Employee Scheduling and Time Off Management system built with React, Express.js, and MySQL.

## Quick Start (3 Steps)

### 1️⃣ Set Up Database
```bash
cd server
mysql -u root -p < setup.sql
# Enter your MySQL password when prompted
```

### 2️⃣ Start Backend Server
```bash
cd server
npm install
npm run dev
# Server runs on http://localhost:5000
```

### 3️⃣ Start Frontend (New Terminal)
```bash
npm install
npm start
# Frontend opens at http://localhost:3000
```

### Login with Demo Credentials
- **Admin**: username: `admin` | password: `admin123`
- **Employee**: username: `user` | password: `user123`

---

## Documentation

### Getting Started
- [📖 Complete Setup Guide](SETUP_GUIDE.md) - Step-by-step installation
- [🚀 Quick Start Scripts](quickstart.bat) - Automated setup for Windows
- [🐧 Linux/Mac Setup](quickstart.sh) - Automated setup for Mac/Linux

### Understanding the System
- [📋 Conversion Summary](CONVERSION_SUMMARY.md) - What changed from local storage
- [📊 Project Structure](PROJECT_STRUCTURE.md) - File organization
- [🔍 Conversion Report](CONVERSION_REPORT.md) - Detailed technical report

### Development
- [API Reference](API_REFERENCE.md) - Complete endpoint documentation
- [Server README](server/README.md) - Backend-specific information

### Tools & Scripts
- [Database Test](test-database.bat) - Windows: Verify MySQL setup
- [Database Test](test-database.sh) - Mac/Linux: Verify MySQL setup

---

## Key Features

✅ **Employee Schedule Management**
- View weekly schedules
- Assign/unassign employees from shifts (admin only)
- Support for multiple weeks
- Three shift types: Morning, Afternoon, Night

✅ **Time Off Management**
- Request vacation, sick leave, or personal time
- Track request status (pending, approved, denied)
- Admin approval/denial workflow
- Employee request history

✅ **Authentication**
- Secure login system
- Role-based access (admin/user)
- User profile information

✅ **Data Persistence**
- MySQL database stores all information
- Changes persist across sessions
- No data loss on page refresh

---

## System Architecture

```
┌─────────────────┐
│                 │
│  React Frontend │ (Port 3000)
│  (User Interface)│
│                 │
└────────┬────────┘
         │ API Calls
         │ (HTTP/JSON)
         ▼
┌─────────────────┐
│                 │
│ Express Backend │ (Port 5000)
│ (API Server)    │
│                 │
└────────┬────────┘
         │ Database Queries
         │ (SQL)
         ▼
┌─────────────────┐
│                 │
│ MySQL Database  │
│ (Data Storage)  │
│                 │
└─────────────────┘
```

---

## Technology Stack

### Frontend
- **React 19** - UI Framework
- **CSS3** - Styling
- **JavaScript ES6+** - Programming language

### Backend
- **Node.js** - Runtime environment
- **Express.js 4.18** - Web framework
- **MySQL2** - Database driver

### Database
- **MySQL 8.0+** - Relational database

---

## Prerequisites

Before starting, install:

1. **Node.js** (v14 or higher)
   - Download: https://nodejs.org/

2. **MySQL Server** (8.0 or higher)
   - Download: https://dev.mysql.com/downloads/mysql/

3. **npm** (comes with Node.js)
   - Verify: `npm --version`

---

## API Endpoints

### Authentication
```
POST /api/auth/login
```

### Schedule
```
GET /api/schedule/week/:week
POST /api/schedule/update
GET /api/schedule/employees
```

### Time Off
```
GET /api/timeoff/requests
GET /api/timeoff/requests/:employeeName
POST /api/timeoff/request
POST /api/timeoff/approve/:id
POST /api/timeoff/deny/:id
```

See [API_REFERENCE.md](API_REFERENCE.md) for complete details.

---

## Database Schema

### Users Table
- Stores employee and admin accounts
- 6 test accounts pre-loaded

### Schedules Table
- Records employee shift assignments
- Organized by week, day, and shift
- Sample data for week 0

### Time Off Requests Table
- Tracks time off requests
- Status: pending, approved, denied
- Sample requests for testing

---

## Development Workflow

### Making Changes

**Frontend Changes:**
1. Edit files in `src/` folder
2. Changes auto-reload (React dev server)
3. Check browser console for errors

**Backend Changes:**
1. Edit files in `server/routes/` folder
2. Server auto-reloads (nodemon)
3. Check terminal for errors

**Database Changes:**
1. Edit `server/setup.sql`
2. Re-run: `mysql -u root -p < server/setup.sql`
3. Verify in MySQL client

### Testing Endpoints

Use Postman or curl:
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get schedule
curl http://localhost:5000/api/schedule/week/0
```

---

## Troubleshooting

### Database Connection Error
**Problem:** "Cannot connect to database"

**Solution:**
1. Check if MySQL is running
   - Windows: Open Services, find MySQL80, click Start
   - Mac: `brew services start mysql`
   - Linux: `sudo systemctl start mysql`
2. Verify credentials in `server/config/database.js`
3. Test connection: `mysql -u root -p`

### Port Already in Use
**Problem:** "Port 3000/5000 already in use"

**Solution:**
- Kill the process using the port
- Or change port in the application

### Module Not Found
**Problem:** "Cannot find module 'express'"

**Solution:**
```bash
cd server
npm install  # In the backend folder
```

### CORS Errors
**Problem:** "Access-Control-Allow-Origin" error in console

**Solution:**
- Ensure backend is running on port 5000
- Check `API_URL` in `src/App.js` matches backend URL

### MySQL Too Many Connections
**Solution:**
1. Close unused MySQL connections
2. Restart MySQL server
3. Increase connection limit in database.js

---

## Performance Tips

### Frontend
- Use React DevTools to profile components
- Check Network tab for slow API calls
- Minimize bundle size

### Backend
- Add database indexes for frequent queries
- Implement caching for schedule data
- Monitor request response times

### Database
- Use EXPLAIN to analyze slow queries
- Implement query optimization
- Regular backups

---

## Security Considerations

### Current (Development)
- Passwords stored in plain text (demo only)
- No request validation
- CORS allows all origins
- No rate limiting

### Production Recommendations
- Hash passwords with bcrypt
- Implement JWT token authentication
- Add request validation
- Restrict CORS to your domain
- Implement rate limiting
- Use HTTPS
- Add logging and monitoring
- Regular security audits

---

## Deployment

### Cloud Deployment Options
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Backend**: Heroku, AWS EC2, DigitalOcean, Railway
- **Database**: AWS RDS, Google Cloud SQL, managed services

### Local Deployment
- Run on your own server with Node.js installed
- Use PM2 to manage processes
- Set up Nginx as reverse proxy

---

## Project Status

✅ **Completed**
- React frontend with all features
- Express backend with API endpoints
- MySQL database with schema
- Authentication system
- Schedule management
- Time off management
- Comprehensive documentation

🔄 **Future Enhancements**
- Email notifications
- Advanced scheduling algorithm
- Employee availability/preferences
- Shift swapping
- Overtime tracking
- Reporting and analytics
- Mobile app
- Two-factor authentication

---

## File Organization

```
concept/
├── public/              # Static files
├── src/                 # React components
│   ├── components/      # Reusable components
│   └── App.js          # Main component
│
├── server/              # Express backend
│   ├── config/         # Configuration
│   ├── routes/         # API endpoints
│   ├── server.js       # Main server file
│   └── setup.sql       # Database schema
│
├── Documentation/       # Guides and references
│   ├── SETUP_GUIDE.md
│   ├── API_REFERENCE.md
│   └── ...
│
└── package.json         # Dependencies
```

---

## Contributing

When contributing:
1. Test your changes locally
2. Update documentation if needed
3. Follow code style guidelines
4. Test all features work

---

## License

This project is open source and available under the MIT License.

---

## Support

### Getting Help
1. Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for installation issues
2. See [API_REFERENCE.md](API_REFERENCE.md) for API questions
3. Review browser console for frontend errors
4. Check backend terminal for server errors

### Common Issues
- Database not connecting? See [SETUP_GUIDE.md - Troubleshooting](SETUP_GUIDE.md#troubleshooting)
- API errors? Check [API_REFERENCE.md - Error Responses](API_REFERENCE.md#error-responses)
- Component issues? Use React DevTools browser extension

---

## About This Project

This Rota Management System was originally built as a React single-page application with local state management. It has been upgraded to a full-stack architecture with:

- **Backend**: Express.js API server
- **Database**: MySQL for persistent storage
- **Frontend**: React client with API integration
- **Documentation**: Comprehensive guides for setup and development

The conversion maintains all original functionality while enabling:
- Data persistence across sessions
- Multi-user support
- Scalable architecture
- Team collaboration
- Easy deployment

---

## Version History

### v2.0 (Current)
- Full-stack with Express backend
- MySQL database
- RESTful API
- Complete documentation

### v1.0 (Original)
- React single-page application
- Local state management
- Demo data only

---

## Questions?

Refer to the documentation:
- [Setup Help](SETUP_GUIDE.md)
- [API Documentation](API_REFERENCE.md)
- [Project Details](CONVERSION_SUMMARY.md)
- [Technical Report](CONVERSION_REPORT.md)

---

## Quick Links

| Document | Purpose |
|----------|---------|
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Installation and configuration |
| [API_REFERENCE.md](API_REFERENCE.md) | API endpoint documentation |
| [CONVERSION_SUMMARY.md](CONVERSION_SUMMARY.md) | Overview of changes |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | File organization |
| [server/README.md](server/README.md) | Backend documentation |

---

**Ready to get started?** See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed installation instructions!
