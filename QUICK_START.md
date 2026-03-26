# Quick Start Guide - 5 Minutes Setup

## Step 1: Install Dependencies (1 min)
```bash
cd attendance-system
pnpm install
```

## Step 2: Configure Environment (2 min)

Create `.env.local` file:
```bash
# Database (get from Neon)
DATABASE_URL=postgresql://user:password@host/dbname

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Cron security
CRON_SECRET=your-random-secret-key
```

**Gmail Setup** (2 minutes):
1. Enable 2FA: https://myaccount.google.com/security
2. Create App Password: https://myaccount.google.com/apppasswords
3. Copy the 16-char password to `SMTP_PASSWORD`

**Neon Setup** (2 minutes):
1. Create account: https://neon.tech
2. Create new project
3. Copy connection string to `DATABASE_URL`

## Step 3: Setup Database (1 min)
```bash
pnpm run migrate
```

Verify:
```bash
psql $DATABASE_URL
\dt
```

## Step 4: Run Development Server
```bash
pnpm dev
```

Visit: **http://localhost:3000**

---

## Testing (5 minutes)

### 1. Register Employee
- Go to http://localhost:3000/auth/register
- Enter email, name, password
- Check email for code
- Verify code

### 2. Login
- Go to http://localhost:3000/auth/login
- Use email & password from registration
- You're logged in!

### 3. Mark Attendance
- Click "Mark Attendance" button
- You'll see check-in time

### 4. Try Admin Features
- Register another account with `"role": "admin"` in request body
- Login as admin
- Visit http://localhost:3000/admin
- View all employees and attendance

---

## Common Commands

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Run production build locally
pnpm start

# Reset database
pnpm run migrate

# Clear cache and reinstall
rm -rf .next node_modules
pnpm install
```

---

## Project Files to Know

| File | Purpose |
|------|---------|
| `.env.local` | Configuration (database, email) |
| `app/api/` | API endpoints |
| `app/auth/` | Login/register pages |
| `app/dashboard/` | Employee dashboard |
| `app/admin/` | Admin dashboard |
| `lib/auth.ts` | Authentication functions |
| `lib/db.ts` | Database connection |
| `lib/email.ts` | Email sending |
| `scripts/01-create-schema.sql` | Database schema |

---

## Troubleshooting Quick Fixes

### "Database connection failed"
```bash
# Check DATABASE_URL is set
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL
```

### "Email not sent"
- Check `SMTP_PASSWORD` is correct (not your Gmail password!)
- Verify 2FA is enabled on Gmail
- Check spam folder

### "Build errors"
```bash
rm -rf .next
pnpm install
pnpm dev
```

### "Port 3000 already in use"
```bash
# Use different port
pnpm dev -- -p 3001
```

---

## Next: Deployment

When ready to deploy:

1. Read `DEPLOYMENT.md` for full instructions
2. Push to GitHub
3. Connect to Vercel
4. Add environment variables
5. Deploy!

See `DEPLOYMENT.md` for detailed steps.

---

## Documentation

- **QUICK_START.md** (this file) - 5-minute setup
- **README.md** - Overview and features
- **DEPLOYMENT.md** - Production deployment
- **API.md** - API endpoint documentation
- **TROUBLESHOOTING.md** - Common issues & fixes
- **PROJECT_STATUS.md** - Project status & checklist
- **CRON_SETUP.md** - Scheduled jobs setup

---

## Need Help?

1. Check **TROUBLESHOOTING.md** for common issues
2. Check terminal output for error messages
3. Review **DEPLOYMENT.md** for env variable setup
4. Check browser DevTools (F12) for client-side errors

---

**You're all set! 🚀 Happy coding!**
