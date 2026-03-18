# Attendance Management System - API Documentation

## Base URL
```
http://localhost:3000 (development)
https://your-domain.com (production)
```

## Authentication Endpoints

### 1. Register
**POST** `/api/auth/register`

Create a new employee account.

**Request Body:**
```json
{
  "email": "employee@example.com",
  "name": "John Doe",
  "password": "securepassword123",
  "role": "employee"  // or "admin"
}
```

**Response (200):**
```json
{
  "message": "Verification code sent to email",
  "email": "employee@example.com"
}
```

**Response (409):**
```json
{
  "error": "Employee with this email already exists"
}
```

---

### 2. Verify Email
**POST** `/api/auth/verify`

Verify email with the 6-digit code sent via email.

**Request Body:**
```json
{
  "email": "employee@example.com",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "message": "Email verified successfully"
}
```

**Response (400):**
```json
{
  "error": "Invalid or expired code"
}
```

---

### 3. Login
**POST** `/api/auth/login`

Authenticate with email and password.

**Request Body:**
```json
{
  "email": "employee@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "employee": {
    "id": "uuid",
    "email": "employee@example.com",
    "name": "John Doe",
    "role": "employee"
  }
}
```

Sets `session_id` cookie (HTTP-only, 30-day expiry).

**Response (400):**
```json
{
  "error": "Invalid email or password"
}
```

---

### 4. Get Current User
**GET** `/api/auth/me`

Get the currently logged-in user's information.

**Headers:**
```
Cookie: session_id=<token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "employee@example.com",
  "role": "employee"
}
```

**Response (401):**
```json
{
  "error": "Unauthorized"
}
```

---

### 5. Logout
**POST** `/api/auth/logout`

Logout and invalidate session.

**Headers:**
```
Cookie: session_id=<token>
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

Clears `session_id` cookie.

---

## Attendance Endpoints

### 1. Mark Attendance
**POST** `/api/attendance/mark`

Mark your attendance for today.

**Headers:**
```
Cookie: session_id=<token>
```

**Response (200):**
```json
{
  "message": "Attendance marked successfully",
  "attendance": {
    "id": "uuid",
    "check_in_time": "2024-03-17T09:30:00Z"
  }
}
```

**Response (400):**
```json
{
  "error": "Attendance already marked for today"
}
```

**Response (401):**
```json
{
  "error": "Unauthorized"
}
```

---

### 2. Get Today's Attendance
**GET** `/api/attendance/get`

Check if you've marked attendance today.

**Headers:**
```
Cookie: session_id=<token>
```

**Response (200):**
```json
{
  "marked": true,
  "attendance": {
    "id": "uuid",
    "check_in_time": "2024-03-17T09:30:00Z"
  }
}
```

Or if not marked:
```json
{
  "marked": false,
  "attendance": null
}
```

---

## Admin Endpoints

### 1. Get All Employees
**GET** `/api/admin/employees`

List all employees with attendance statistics.

**Headers:**
```
Cookie: session_id=<token>
Authorization: Admin role required
```

**Response (200):**
```json
{
  "employees": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "employee",
      "created_at": "2024-03-01T10:00:00Z",
      "total_attendance": 15,
      "last_attendance": "2024-03-17T09:30:00Z"
    }
  ]
}
```

**Response (403):**
```json
{
  "error": "Forbidden - Admin access required"
}
```

---

### 2. Get Attendance Summary
**GET** `/api/admin/attendance`

Get today's attendance summary for all employees.

**Headers:**
```
Cookie: session_id=<token>
Authorization: Admin role required
```

**Response (200):**
```json
{
  "date": "2024-03-17",
  "attendance": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "marked": true,
      "check_in_time": "2024-03-17T09:30:00Z"
    },
    {
      "id": "uuid",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "marked": false,
      "check_in_time": null
    }
  ]
}
```

---

## Cron Job Endpoints

### 1. Check Absence
**GET** `/api/cron/check-absence?secret=CRON_SECRET`

Automatically sends emails to employees who haven't marked attendance.

**Should be called daily at 6 PM via external cron service.**

**Response (200):**
```json
{
  "success": true,
  "message": "Absence notifications sent",
  "count": 3
}
```

**Response (403):**
```json
{
  "error": "Invalid cron secret"
}
```

---

### 2. Archive Attendance
**GET** `/api/cron/archive-attendance?secret=CRON_SECRET`

Archives last month's attendance data for better performance.

**Should be called monthly on the 1st at midnight.**

**Response (200):**
```json
{
  "success": true,
  "message": "Attendance archived successfully",
  "archived_count": 245,
  "deleted_count": 245
}
```

---

## Status Codes

- **200** - Success
- **400** - Bad Request / Invalid Input
- **401** - Unauthorized / Not Logged In
- **403** - Forbidden / Insufficient Permissions
- **409** - Conflict / Resource Already Exists
- **500** - Internal Server Error

## Data Types

### Employee
```typescript
{
  id: string;           // UUID
  email: string;        // Email address
  name: string;         // Full name
  role: 'employee' | 'admin';
  is_verified: boolean; // Email verified
  created_at: string;   // ISO timestamp
}
```

### Attendance
```typescript
{
  id: string;          // UUID
  employee_id: string; // UUID
  check_in_time: string; // ISO timestamp
  date: string;        // YYYY-MM-DD format
}
```

### Session
```typescript
{
  id: string;         // UUID
  employee_id: string; // UUID
  expires_at: string;  // ISO timestamp (30 days)
}
```

## Error Handling

All errors follow this format:
```json
{
  "error": "Human-readable error message"
}
```

## Rate Limiting

- No rate limiting by default
- Recommended: Implement with middleware if needed
- Consider: 100 requests per minute per IP

## CORS

- Allowed origins: Same domain by default
- Credentials: HTTP-only cookies required
