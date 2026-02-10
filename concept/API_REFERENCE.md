# API Reference Documentation

## Base URL
```
http://localhost:5000/api
```

---

## Authentication Endpoints

### Login
Authenticate a user and retrieve their information.

**Endpoint:**
```
POST /api/auth/login
```

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "admin",
    "fullName": "Administrator",
    "employeeName": "Administrator",
    "role": "admin"
  }
}
```

**Response (Failure - 401):**
```json
{
  "error": "Invalid username or password"
}
```

**Example (curl):**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## Schedule Endpoints

### Get Weekly Schedule
Retrieve the schedule for a specific week.

**Endpoint:**
```
GET /api/schedule/week/:week
```

**Parameters:**
- `week` (path) - Week number (0, 1, 2, etc.)

**Response (200):**
```json
{
  "Monday": {
    "Morning (7AM-11AM)": ["Alice Johnson", "Bob Smith"],
    "Afternoon (12PM-8PM)": ["Carol White", "David Brown"],
    "Night (4PM-12AM)": ["Emma Davis"]
  },
  "Tuesday": {
    "Morning (7AM-11AM)": ["Bob Smith", "Carol White"],
    "Afternoon (12PM-8PM)": ["Alice Johnson", "Emma Davis"],
    "Night (4PM-12AM)": ["David Brown"]
  }
  // ... rest of days
}
```

**Example (curl):**
```bash
curl http://localhost:5000/api/schedule/week/0
```

---

### Update Schedule Assignment
Add or remove an employee from a shift.

**Endpoint:**
```
POST /api/schedule/update
```

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "week": 0,
  "day": "Monday",
  "shift": "Morning (7AM-11AM)",
  "employeeName": "Alice Johnson",
  "isAssigned": false
}
```

**Parameters:**
- `week` - Week number
- `day` - Day name (Monday, Tuesday, etc.)
- `shift` - Shift name (Morning (7AM-11AM), Afternoon (12PM-8PM), Night (4PM-12AM))
- `employeeName` - Employee name to assign/remove
- `isAssigned` - `true` to remove, `false` to add

**Response (200):**
```json
{
  "success": true,
  "message": "Schedule updated successfully"
}
```

**Example (curl):**
```bash
curl -X POST http://localhost:5000/api/schedule/update \
  -H "Content-Type: application/json" \
  -d '{
    "week": 0,
    "day": "Monday",
    "shift": "Morning (7AM-11AM)",
    "employeeName": "Alice Johnson",
    "isAssigned": false
  }'
```

---

### Get All Employees
Retrieve list of all employees (non-admin users).

**Endpoint:**
```
GET /api/schedule/employees
```

**Response (200):**
```json
[
  {
    "id": 2,
    "employee_name": "Alice Johnson"
  },
  {
    "id": 3,
    "employee_name": "Bob Smith"
  },
  {
    "id": 4,
    "employee_name": "Carol White"
  }
]
```

**Example (curl):**
```bash
curl http://localhost:5000/api/schedule/employees
```

---

## Time Off Endpoints

### Get All Time Off Requests
Retrieve all time off requests (admin view).

**Endpoint:**
```
GET /api/timeoff/requests
```

**Response (200):**
```json
[
  {
    "id": 1,
    "employee": "Alice Johnson",
    "startDate": "2026-12-15",
    "endDate": "2026-12-17",
    "type": "vacation",
    "reason": "Family holiday",
    "status": "pending",
    "requestedDate": "2026-12-05"
  },
  {
    "id": 2,
    "employee": "Bob Smith",
    "startDate": "2026-12-20",
    "endDate": "2026-12-22",
    "type": "sick",
    "reason": "Medical appointment",
    "status": "approved",
    "requestedDate": "2026-12-03"
  }
]
```

**Example (curl):**
```bash
curl http://localhost:5000/api/timeoff/requests
```

---

### Get Employee's Time Off Requests
Retrieve time off requests for a specific employee.

**Endpoint:**
```
GET /api/timeoff/requests/:employeeName
```

**Parameters:**
- `employeeName` (path) - Name of the employee

**Response (200):**
```json
[
  {
    "id": 1,
    "employee": "Alice Johnson",
    "startDate": "2026-12-15",
    "endDate": "2026-12-17",
    "type": "vacation",
    "reason": "Family holiday",
    "status": "pending",
    "requestedDate": "2026-12-05"
  }
]
```

**Example (curl):**
```bash
curl http://localhost:5000/api/timeoff/requests/Alice%20Johnson
```

---

### Create Time Off Request
Submit a new time off request.

**Endpoint:**
```
POST /api/timeoff/request
```

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "employeeName": "Alice Johnson",
  "startDate": "2026-12-15",
  "endDate": "2026-12-17",
  "type": "vacation",
  "reason": "Family holiday"
}
```

**Parameters:**
- `employeeName` - Name of the requesting employee
- `startDate` - Start date (YYYY-MM-DD format)
- `endDate` - End date (YYYY-MM-DD format)
- `type` - Type of request: `vacation`, `sick`, `personal`, `other`
- `reason` - (Optional) Reason for the request

**Response (200):**
```json
{
  "success": true,
  "id": 4,
  "message": "Request created successfully"
}
```

**Example (curl):**
```bash
curl -X POST http://localhost:5000/api/timeoff/request \
  -H "Content-Type: application/json" \
  -d '{
    "employeeName": "Alice Johnson",
    "startDate": "2026-12-15",
    "endDate": "2026-12-17",
    "type": "vacation",
    "reason": "Family holiday"
  }'
```

---

### Approve Time Off Request
Approve a pending time off request.

**Endpoint:**
```
POST /api/timeoff/approve/:id
```

**Parameters:**
- `id` (path) - ID of the request to approve

**Response (200):**
```json
{
  "success": true,
  "message": "Request approved"
}
```

**Example (curl):**
```bash
curl -X POST http://localhost:5000/api/timeoff/approve/1
```

---

### Deny Time Off Request
Deny a pending time off request.

**Endpoint:**
```
POST /api/timeoff/deny/:id
```

**Parameters:**
- `id` (path) - ID of the request to deny

**Response (200):**
```json
{
  "success": true,
  "message": "Request denied"
}
```

**Example (curl):**
```bash
curl -X POST http://localhost:5000/api/timeoff/deny/1
```

---

## Error Responses

### 400 Bad Request
Missing required parameters or invalid input.

```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
Invalid credentials or authentication failed.

```json
{
  "error": "Invalid username or password"
}
```

### 500 Internal Server Error
Server-side error occurred.

```json
{
  "error": "Failed to fetch schedule",
  "message": "Error details here"
}
```

---

## Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (missing/invalid parameters) |
| 401 | Unauthorized (login failed) |
| 500 | Internal Server Error |

---

## Data Validation Rules

### Schedule Updates
- `week`: Must be a valid integer (0 or greater)
- `day`: Must be a day name (Monday, Tuesday, etc.)
- `shift`: Must be a valid shift name
- `employeeName`: Must match an existing employee name

### Time Off Requests
- `startDate` and `endDate`: Must be in YYYY-MM-DD format
- `startDate` must be less than or equal to `endDate`
- `type`: Must be one of: `vacation`, `sick`, `personal`, `other`
- `employeeName`: Must match an existing employee name

### Login
- `username`: Must not be empty
- `password`: Must not be empty

---

## Testing the API with Postman

1. Import the following collection or create manually:
2. Base URL: `http://localhost:5000/api`
3. Set Content-Type header: `application/json`

### Test Sequence:
1. **Login** → Copy user data for subsequent requests
2. **Get Weekly Schedule** → Verify data
3. **Create Time Off Request** → Submit a request
4. **Get Time Off Requests** → Verify request was created
5. **Approve Request** → Test approval workflow

---

## Rate Limiting
Currently, there is no rate limiting implemented. For production, consider adding:
- Rate limiting middleware
- Request validation
- Authentication tokens (JWT)
- CORS restrictions

---

## CORS Headers
The API is configured to accept requests from any origin (development setting). For production, restrict to your frontend domain:

```javascript
app.use(cors({
  origin: 'https://yourdomain.com'
}));
```
