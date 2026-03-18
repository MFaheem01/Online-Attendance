# 🎯 START HERE - Attendance Management System

**Welcome!** This is a complete, production-ready attendance management system built with Next.js and PostgreSQL.

## ⚡ 5-Minute Quick Start

```bash
# 1. Install
pnpm install

# 2. Setup .env.local (see below)
# DATABASE_URL=...
# SMTP_USER=...
# SMTP_PASSWORD=...

# 3. Migrate database
pnpm run migrate

# 4. Run
pnpm dev

# 5. Visit http://localhost:3000
```

## 🔧 Setup (2 minutes)

Create `.env.local`:
```bash
DATABASE_URL=postgresql://...  # From Neon
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Gmail App Password, not regular password
CRON_SECRET=any-random-string
```

**Need help with Gmail?**
1. Enable 2FA: https://myaccount.google.com/security
2. Create App Password: https://myaccount.google.com/apppasswords
3. Paste the 16-char password here

**Need database?**
1. Create account: https://neon.tech
2. Create new project
3. Copy connection string here

## 📚 Documentation

| File | Purpose | Time |
|------|---------|------|
| **QUICK_START.md** | Quick setup guide | 5 min |
| **README.md** | Features & overview | 10 min |
| **API.md** | All API endpoints | 30 min |
| **DEPLOYMENT.md** | Production deploy | 20 min |
| **TROUBLESHOOTING.md** | Common issues | 20 min |
| **DOCS.md** | Full doc index | - |

👉 **Start with QUICK_START.md after this file**

## ✨ What's Included

✅ **Authentication**
- Email registration with verification codes
- Secure login with password hashing
- Session management with HTTP-only cookies
- Role-based access (admin/employee)

✅ **Features**
- Employee attendance marking (one-click)
- Employee dashboard with status
- Admin dashboard with reports
- Automatic absence detection
- Email notifications
- Monthly data archival

✅ **Technical**
- Next.js 16 with TypeScript
- PostgreSQL database
- Nodemailer for emails
- Tailwind CSS + shadcn/ui
- API documentation
- 4 comprehensive guides
- Troubleshooting guide

## 🚀 Three Ways to Deploy

### Option 1: Vercel (Recommended - 5 min)
```bash
# Login to Vercel
vercel login

# Add environment variables
vercel env add DATABASE_URL
vercel env add SMTP_HOST
vercel env add SMTP_PORT
vercel env add SMTP_USER
vercel env add SMTP_PASSWORD
vercel env add CRON_SECRET

# Deploy
vercel deploy --prod
```

### Option 2: GitHub + Vercel (10 min)
1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Auto-deploy on git push

### Option 3: Manual Server (20 min)
See DEPLOYMENT.md for Docker/traditional server setup

## 🧪 Test It Out

### 1. Register
- Go to http://localhost:3000/auth/register
- Enter email, name, password
- Check email for 6-digit code
- Enter code and verify

### 2. Login
- Go to http://localhost:3000/auth/login
- Use email & password
- Done! You're logged in

### 3. Mark Attendance
- Click "Mark Attendance"
- You'll see check-in time

### 4. Admin Features
- Register as admin (add `"role": "admin"`)
- Login and visit http://localhost:3000/admin
- View employees and attendance

## 📋 Project Structure

```
├── app/
│   ├── api/              # All API endpoints
│   ├── auth/             # Login/register pages
│   ├── admin/            # Admin dashboard
│   └── dashboard/        # Employee dashboard
├── components/           # React components
├── lib/                  # Utilities (auth, db, email)
├── scripts/              # Database migrations
├── *.md                  # Documentation files
└── package.json
```

## 🐛 Something Not Working?

1. **Check logs** - Terminal where `pnpm dev` runs
2. **Check DevTools** - F12 in browser
3. **Read TROUBLESHOOTING.md** - 50+ solutions included
4. **Verify .env.local** - All variables set?

## 📞 Common Issues Quick Fixes

**"Database connection failed"**
```bash
echo $DATABASE_URL  # Should show your URL
```

**"Email not sent"**
- Check SMTP_PASSWORD (Gmail App Password, not regular password!)
- Verify 2FA is enabled
- Check spam folder

**"Build error"**
```bash
rm -rf .next && pnpm install && pnpm dev
```

**Port 3000 already in use**
```bash
pnpm dev -- -p 3001
```

## 🎓 Learning Path

1. **This file** (5 min) - Understand overview
2. **QUICK_START.md** (5 min) - Get running
3. **README.md** (10 min) - Learn features
4. **API.md** (30 min) - Understand endpoints
5. **DEPLOYMENT.md** (20 min) - Deploy to production

Then you're ready to use, customize, or deploy!

## 💾 Database

The system creates 5 tables automatically:
- **employees** - User accounts with roles
- **verification_codes** - Email verification (15-min expiry)
- **sessions** - Login sessions (30-day expiry)
- **attendance** - Daily check-ins
- **attendance_archive** - Monthly archived data

## 🔐 Security

✅ Passwords hashed with bcryptjs
✅ HTTP-only session cookies
✅ Email verification before login
✅ Role-based access control
✅ Admin actions protected
✅ CRON_SECRET for scheduled jobs

## 📊 Key Files

| File | What It Does |
|------|--------------|
| `.env.local` | Configuration |
| `lib/auth.ts` | Login/register logic |
| `lib/db.ts` | Database connection |
| `lib/email.ts` | Email sending |
| `app/api/` | All endpoints |
| `scripts/01-create-schema.sql` | Database setup |

## 🎯 Next Steps

1. **Now**: Run `pnpm install`
2. **Next**: Create `.env.local` with database & email
3. **Then**: Run `pnpm run migrate`
4. **Start**: `pnpm dev` and visit http://localhost:3000
5. **Ready**: Deploy when you want!

## 📖 Full Documentation

Need more details? Check these files:

- **DOCS.md** - Complete documentation index
- **QUICK_START.md** - 5-minute setup
- **README.md** - Features & capabilities
- **API.md** - All 12 API endpoints with examples
- **DEPLOYMENT.md** - Production deployment guide
- **CRON_SETUP.md** - Scheduled jobs setup
- **TROUBLESHOOTING.md** - 50+ common issues
- **PROJECT_STATUS.md** - Project checklist & status

## ✅ Production Ready

This project is:
- ✅ Fully functional
- ✅ Well documented
- ✅ Security hardened
- ✅ Performance optimized
- ✅ Ready to deploy
- ✅ Ready to customize

## 🎉 Ready?

```bash
# Let's go!
pnpm install
# Then follow QUICK_START.md
```

---

**Questions?** Check TROUBLESHOOTING.md or DOCS.md

**Found a bug?** Check the issue in TROUBLESHOOTING.md first

**Ready to deploy?** Follow DEPLOYMENT.md

**Happy coding! 🚀**

---

**Project Status**: ✅ Production Ready  
**Last Updated**: March 17, 2026
