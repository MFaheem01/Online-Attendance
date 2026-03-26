# Attendance Management System - Deployment Guide

## Quick Start

### 1. Prerequisites
- Node.js 18+ and pnpm installed
- Neon PostgreSQL database account
- Gmail account or SMTP server credentials
- Vercel account (for hosting)

### 2. Environment Variables Setup

Create a `.env.local` file in the root directory with these variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@host/dbname

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Not your regular password - use App Password

# Cron Jobs
CRON_SECRET=your-secret-key-here  # Use a random secure string
```

#### Gmail Setup for SMTP:
1. Enable 2-factor authentication on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Create an App Password for "Mail" and "Windows Computer"
4. Copy the 16-character password to `SMTP_PASSWORD`

### 3. Installation

```bash
# Install dependencies
pnpm install

# Apply database migrations
pnpm run migrate  # Or use: npm run migrate

# Start development server
pnpm dev
```

Visit http://localhost:3000 to test the application.

### 4. Database Setup

The database schema is automatically created by the migration script. To verify:

```bash
# Connect to your Neon database and run:
SELECT * FROM employees;
SELECT * FROM attendance;
SELECT * FROM verification_codes;
```

### 5. Testing the Application

#### Employee Registration:
1. Go to http://localhost:3000/auth/register
2. Enter email, name, and password
3. Check email for 6-digit verification code
4. Enter code at http://localhost:3000/auth/verify
5. Login at http://localhost:3000/auth/login

#### Admin Features:
- Register as admin by adding `"role": "admin"` in the registration request body
- Access admin dashboard at http://localhost:3000/admin
- View employees and attendance reports

### 6. Deployment to Vercel

#### Option 1: Using Git Integration
1. Push your code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel Settings → Environment Variables
4. Deploy automatically on git push

#### Option 2: Using Vercel CLI
```bash
npm install -g vercel
vercel env add DATABASE_URL
vercel env add SMTP_HOST
vercel env add SMTP_PORT
vercel env add SMTP_USER
vercel env add SMTP_PASSWORD
vercel env add CRON_SECRET
vercel deploy
```

### 7. Scheduled Jobs Setup

The system includes two automated cron jobs:

#### Absence Detection (Daily at 6 PM)
- Endpoint: `/api/cron/check-absence`
- Sends email to employees who haven't marked attendance
- Use a service like EasyCron or Vercel Cron:
  ```
  https://your-domain.com/api/cron/check-absence?secret=YOUR_CRON_SECRET
  ```

#### Archive Attendance (Monthly on 1st)
- Endpoint: `/api/cron/archive-attendance`
- Moves old attendance to archive table
- Setup:
  ```
  https://your-domain.com/api/cron/archive-attendance?secret=YOUR_CRON_SECRET
  ```

#### Setting up with EasyCron:
1. Go to https://www.easycron.com
2. Create new cron job
3. URL: `https://your-domain.com/api/cron/check-absence?secret=YOUR_CRON_SECRET`
4. Cron Expression: `0 18 * * *` (Daily at 6 PM)
5. Repeat for archive endpoint with: `0 0 1 * *` (Monthly on 1st at midnight)

### 8. Project Structure

```
/app
  /api - All API endpoints
    /auth - Authentication routes (register, login, verify, logout, me)
    /attendance - Attendance marking endpoints
    /admin - Admin management endpoints
    /cron - Scheduled job endpoints
  /auth - Authentication pages (register, verify, login)
  /admin - Admin dashboard pages
  /dashboard - Employee dashboard page

/components
  /dashboard - Employee dashboard components
  /admin - Admin dashboard components
  /ui - shadcn/ui components

/lib
  auth.ts - Authentication utilities
  db.ts - Database connection
  email.ts - Email sending utilities
  middleware.ts - Request middleware
  
/scripts
  01-create-schema.sql - Database schema
```

### 9. Database Schema

#### Tables:
1. **employees** - User accounts with role-based access
2. **verification_codes** - Email verification codes (15-min expiry)
3. **sessions** - User sessions with 30-day expiry
4. **attendance** - Daily attendance records
5. **attendance_archive** - Monthly archived attendance data

### 10. Security Notes

- Passwords are hashed with bcryptjs
- Sessions stored with HTTP-only cookies
- All API endpoints require authentication (except /auth/*)
- Admin endpoints check role before processing
- CRON_SECRET prevents unauthorized job execution
- Input validation on all endpoints

### 11. Troubleshooting

#### "Database connection failed"
- Verify DATABASE_URL is correct
- Check Neon database is running
- Ensure IP whitelist allows your connection

#### "SMTP authentication failed"
- Verify email credentials
- For Gmail, use App Password (not regular password)
- Check SMTP_PORT (should be 587 or 465)

#### "Module not found" errors
- Run `pnpm install` again
- Delete `.next` folder and restart dev server
- Verify import paths use `@/` alias

#### Cron jobs not running
- Verify CRON_SECRET is set correctly in environment
- Check job logs at /api/cron/check-absence and /api/cron/archive-attendance
- Ensure external cron service is calling correct URL

### 12. API Documentation

See `API.md` for detailed endpoint documentation.

### 13. Support

For issues:
1. Check debug logs in browser console
2. Review server logs in terminal
3. Check database for data consistency
4. Verify environment variables are set
