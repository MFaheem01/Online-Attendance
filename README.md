# Attendance Management System

A full-stack employee attendance tracking and management system built with Next.js, PostgreSQL (Neon), and TypeScript.

## Features

### Employee Features
- Email verification during registration
- Daily attendance marking with one-click check-in
- View personal attendance status
- Automatic absence detection and email notifications
- Secure session-based authentication

### Admin Features
- Employee management dashboard
- Real-time attendance tracking
- Monthly attendance reports and archival
- View attendance statistics
- Employee list with attendance history

### System Features
- 6-digit email verification codes (15-minute validity)
- Automatic absence reminders sent at end of day
- Monthly attendance data archival with historical reporting
- Secure password hashing with bcryptjs
- HTTP-only session cookies
- SMTP-based email notifications

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Node.js
- **Database:** PostgreSQL (Neon)
- **Authentication:** Email-based verification + session management
- **Email:** Nodemailer with Gmail SMTP

## Setup Instructions

### Prerequisites

- Node.js 18+
- A Neon PostgreSQL database
- Gmail account (or any SMTP provider) for sending emails
- A method to run scheduled cron jobs (EasyCron, AWS Lambda, etc.)

### Environment Variables

Set these in your Vercel project settings:

```
DATABASE_URL=postgresql://user:password@host/database
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
CRON_SECRET=your-secret-cron-token
```

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Database Setup:**
   The database schema is already created and available in `scripts/01-create-schema.sql`. If you need to recreate it, execute this file on your Neon database.

3. **Development:**
   ```bash
   npm run dev
   ```
   Navigate to http://localhost:3000

4. **Production:**
   Deploy to Vercel with your environment variables configured.

## User Flows

### Employee Registration
1. Navigate to `/auth/register`
2. Enter name, email, password, and select role
3. Receive 6-digit verification code via email
4. Verify email at `/auth/verify`
5. Log in at `/auth/login`
6. Access dashboard to mark daily attendance

### Admin Registration
1. Follow the same registration flow but select "Admin" as the role
2. Only admin accounts can access the admin dashboard
3. Access admin dashboard at `/admin` after login

### Daily Attendance
1. Log in to employee dashboard
2. Click "Mark Attendance" button
3. System records check-in time with millisecond precision
4. Cannot mark attendance twice per day

### Absence Detection
- System checks for unmarked attendance at 5 PM daily
- Employees who haven't marked attendance receive reminder emails
- Admins can see real-time absence status on the admin dashboard

### Monthly Archival
- On the first day of each month, previous month's data is archived
- Historical data remains accessible through attendance_archive table
- Active attendance table stays optimized for performance

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new employee
- `POST /api/auth/verify` - Verify email with code
- `POST /api/auth/login` - Employee login
- `POST /api/auth/logout` - Logout and destroy session
- `GET /api/auth/me` - Get current user info

### Attendance
- `POST /api/attendance/mark` - Mark daily attendance
- `GET /api/attendance/get` - Get today's attendance status

### Admin
- `GET /api/admin/employees` - List all employees with stats
- `GET /api/admin/attendance` - Get today's attendance summary

### Cron Jobs
- `POST /api/cron/check-absence` - Check and email absent employees
- `POST /api/cron/archive-attendance` - Archive monthly data

See `CRON_SETUP.md` for detailed cron job configuration.

## Database Schema

### Tables
- `employees` - User accounts with roles (employee/admin)
- `verification_codes` - Email verification codes
- `sessions` - Active user sessions
- `attendance` - Daily attendance records
- `attendance_archive` - Monthly archived attendance

## Security Features

- Password hashing with bcryptjs (10 salt rounds)
- HTTP-only session cookies
- CSRF protection via secure cookies
- Verification code expiration (15 minutes)
- Admin-only access to admin dashboard
- Row-level security for user data

## Testing

### Manual Testing Checklist

1. **Registration Flow**
   - Register as employee ✓
   - Register as admin ✓
   - Verify email with code ✓
   - Email verification expires after 15 min ✓

2. **Login Flow**
   - Login with correct credentials ✓
   - Reject invalid credentials ✓
   - Redirect to correct dashboard (employee vs admin) ✓

3. **Attendance**
   - Mark attendance once per day ✓
   - Cannot mark twice on same day ✓
   - View attendance status on dashboard ✓

4. **Admin Dashboard**
   - View all employees ✓
   - View daily attendance summary ✓
   - Non-admins cannot access ✓

5. **Cron Jobs**
   - Test absence detection endpoint ✓
   - Test archival endpoint ✓
   - Verify CRON_SECRET validation ✓

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Project Settings → Environment Variables
3. Deploy - Vercel will automatically build and deploy

### Post-Deployment

1. Set up cron jobs using an external service (EasyCron, AWS Lambda, etc.)
2. Configure the cron endpoints:
   - Absence check: Daily at 5 PM UTC
   - Archive: First day of month at 12 AM UTC
3. Test endpoints with your CRON_SECRET

## Troubleshooting

### Email Not Sending
- Check SMTP credentials in environment variables
- Verify Gmail app-specific password (not regular password)
- Check spam folder for verification emails
- Ensure SMTP_HOST and SMTP_PORT are correct

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check Neon database is accessible
- Ensure network whitelist includes your IP

### Cron Jobs Not Running
- Verify CRON_SECRET matches in requests
- Check that endpoint URLs are publicly accessible
- Verify Authorization header format: `Bearer YOUR_SECRET`
- Check application logs for errors

## Future Enhancements

- Leave request system
- Attendance reports and analytics
- Multiple check-in points (in/out)
- Geolocation-based attendance
- Mobile app
- Biometric authentication
- Calendar view of attendance
- Email digest reports

## Support

For issues or questions, check the logs in Vercel's deployment dashboard or enable debug logging by checking console output.

## License

This project is provided as-is for internal business use.
