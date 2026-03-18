# Troubleshooting Guide

## Build & Compilation Errors

### Error: "Export pool doesn't exist in target module"
**Cause**: Stale build cache showing old imports

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Restart dev server
pnpm dev
```

### Error: "Cannot find module '@/lib/db'"
**Cause**: Path alias not configured properly

**Solution**:
1. Verify `jsconfig.json` or `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

2. If using TypeScript, restart the dev server:
```bash
pnpm dev
```

### Error: "Module not found: pg"
**Cause**: Dependencies not installed

**Solution**:
```bash
pnpm install
# or
npm install
```

---

## Database Errors

### Error: "Connection refused - ECONNREFUSED 127.0.0.1:5432"
**Cause**: PostgreSQL not running or DATABASE_URL not set

**Solution**:
1. Check DATABASE_URL:
```bash
echo $DATABASE_URL
```

2. If using Neon:
   - Get connection string from Neon dashboard
   - Ensure it starts with `postgresql://`
   - Format: `postgresql://user:password@host/database`

3. Test connection:
```bash
psql "your-database-url"
```

### Error: "FATAL: password authentication failed for user"
**Cause**: Wrong password in DATABASE_URL

**Solution**:
1. Go to Neon dashboard
2. Copy the connection string again
3. Update DATABASE_URL with correct credentials
4. Restart dev server

### Error: "permission denied for schema public"
**Cause**: User lacks permissions

**Solution**:
1. Use database owner/admin account
2. Or grant permissions:
```sql
GRANT ALL ON SCHEMA public TO your_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO your_user;
```

### Error: "Database does not exist"
**Cause**: Database not created in migration

**Solution**:
```bash
# Run migrations
pnpm run migrate

# Check tables exist
psql "your-database-url"
# In psql:
\dt
```

---

## Email/SMTP Errors

### Error: "SMTP authentication failed"
**Cause**: Incorrect email credentials

**Solution for Gmail**:
1. Enable 2-Factor Authentication
2. Generate App Password:
   - Visit: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Copy the 16-character password
3. Update `.env.local`:
```bash
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # Paste app password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

4. Restart dev server

### Error: "SMTP connection timeout"
**Cause**: Wrong SMTP host or port

**Solution**:
- For Gmail: Use `smtp.gmail.com` and port `587`
- For other services, check their docs
- Verify:
```bash
# Linux/Mac
nc -zv smtp.gmail.com 587

# Windows
Test-NetConnection -ComputerName smtp.gmail.com -Port 587
```

### Error: "Email not received"
**Cause**: Email marked as spam or not sent

**Solution**:
1. Check server logs for errors:
```bash
# In terminal running pnpm dev
# Look for "Failed to send verification email"
```

2. Check spam folder in email
3. Verify email address is correct
4. Test with a different email
5. Check SMTP credentials are correct

### Error: "nodemailer not found"
**Cause**: nodemailer not installed

**Solution**:
```bash
pnpm add nodemailer
pnpm add -D @types/nodemailer
```

---

## Authentication Issues

### Error: "Invalid or expired code" on verification
**Cause**: Code expired (15-min limit) or typo

**Solution**:
1. Request new code by registering again
2. Verify code within 15 minutes
3. Check for typos in code

### Error: "Email/password not found" on login
**Cause**: Email not registered or password wrong

**Solution**:
1. Register new account if not exists
2. Verify email before login
3. Check password is correct (case-sensitive)

### Error: "Unauthorized" on protected routes
**Cause**: Session cookie not set or expired

**Solution**:
1. Login again
2. Check browser cookies:
   - Open DevTools (F12)
   - Application → Cookies
   - Verify `session_id` exists
3. Clear cookies and login again:
```javascript
// In browser console
document.cookie = "session_id=;expires=Thu, 01 Jan 1970 00:00:00 UTC;";
```

### Error: "Session expired"
**Cause**: 30-day session timeout

**Solution**:
- Login again
- Consider implementing refresh tokens for longer sessions

---

## API & Runtime Errors

### Error: 400 Bad Request
**Cause**: Missing or invalid request body

**Check**:
- All required fields are present
- Data types are correct
- JSON is valid (no trailing commas)

**Example Fix**:
```javascript
// ❌ Wrong
const data = {
  email: "test@example.com",
  name: "John",
  password: "pass123",
};  // Trailing comma

// ✅ Correct
const data = {
  email: "test@example.com",
  name: "John",
  password: "pass123"
};
```

### Error: 401 Unauthorized
**Cause**: Not logged in or session expired

**Solution**:
1. Check if logged in: `/api/auth/me`
2. If not, login again
3. Check session cookie exists in browser

### Error: 403 Forbidden
**Cause**: Not an admin accessing admin endpoint

**Solution**:
1. Register/login as admin user
2. Check role in `/api/auth/me`
3. Admin users have `role: "admin"`

### Error: 500 Internal Server Error
**Cause**: Server-side error

**Debug Steps**:
1. Check terminal for error message
2. Enable debug logging:
```javascript
// Add in route file
console.log("[v0] Debug info:", variable);
```

3. Check database connection
4. Check all environment variables set
5. Review error stack trace in terminal

---

## Frontend/UI Issues

### Issue: Page shows loading forever
**Cause**: API call hanging or network error

**Solution**:
1. Check browser DevTools → Network tab
2. Verify API endpoint is responding
3. Check server terminal for errors
4. Verify database connection

### Issue: Components not styling correctly
**Cause**: Tailwind CSS not loaded

**Solution**:
```bash
# Rebuild Tailwind CSS
rm -rf .next
pnpm dev
```

### Issue: Pages show blank
**Cause**: Hydration mismatch or missing data

**Solution**:
1. Open DevTools Console (F12)
2. Look for errors
3. Check if data is loading: `/api/auth/me`
4. Try refreshing page

---

## Cron Job Issues

### Issue: Absence detection email not sent
**Cause**: Job not triggered or email config wrong

**Solution**:
1. Verify external cron service is calling URL correctly:
   ```
   https://your-domain.com/api/cron/check-absence?secret=YOUR_CRON_SECRET
   ```

2. Check CRON_SECRET is correct in:
   - Environment variables
   - External cron service

3. Verify email credentials are correct

4. Check job logs (add to response):
   ```javascript
   // In route.ts
   console.log("[v0] Cron job starting...");
   ```

### Issue: "Invalid cron secret"
**Cause**: Secret mismatch

**Solution**:
1. Generate new secret:
   ```bash
   openssl rand -hex 32
   ```

2. Update in `.env.local`:
   ```bash
   CRON_SECRET=your-new-secret
   ```

3. Restart dev server

4. Update external cron service with new secret

---

## Deployment Issues

### Issue: Works locally but not on Vercel
**Cause**: Missing environment variables on Vercel

**Solution**:
1. Go to Vercel Dashboard → Project Settings
2. Environment Variables
3. Add all variables:
   - DATABASE_URL
   - SMTP_HOST
   - SMTP_PORT
   - SMTP_USER
   - SMTP_PASSWORD
   - CRON_SECRET

4. Redeploy:
   ```bash
   vercel --prod
   ```

### Issue: Database errors on production
**Cause**: Different environment or connection pool issue

**Solution**:
1. Verify DATABASE_URL on Vercel matches Neon
2. Check Neon database is running
3. Check connection pooling:
   ```javascript
   // Update db.ts if needed
   pool = new Pool({
     connectionString,
     max: 20,  // Connection pool size
   });
   ```

### Issue: Emails not sending on production
**Cause**: SMTP credentials not set or email provider blocks connection

**Solution**:
1. Verify SMTP credentials on Vercel
2. For Gmail, may need "Less secure apps" enabled or App Password
3. Check email provider's firewall/IP whitelist
4. Try different email provider (SendGrid, Mailgun, etc.)

---

## Performance Issues

### Issue: Slow database queries
**Cause**: Missing indexes or inefficient queries

**Solution**:
1. Check if tables have indexes:
   ```sql
   \di  -- List all indexes
   ```

2. Re-run migrations to add indexes:
   ```bash
   pnpm run migrate
   ```

3. Archive old attendance data monthly

### Issue: High memory usage
**Cause**: Large data transfers or memory leaks

**Solution**:
1. Implement pagination for large lists
2. Add database query limits
3. Close database connections properly
4. Clear old sessions

---

## General Debugging

### Enable Debug Logging
Add to any file:
```javascript
console.log("[v0] Debug message:", variable);
```

View logs:
- **Local**: Terminal where `pnpm dev` runs
- **Production**: Vercel Dashboard → Logs

### Check Environment Variables
```bash
# Local
env | grep DATABASE_URL
env | grep SMTP_

# Vercel Dashboard
Settings → Environment Variables
```

### Test API Endpoints
```bash
# Test register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test","password":"pass123"}'

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'
```

### Check Database Directly
```bash
# Connect to Neon
psql "your-database-url"

# Check tables
\dt

# Check employee count
SELECT COUNT(*) FROM employees;

# Check today's attendance
SELECT * FROM attendance WHERE DATE(check_in_time) = CURRENT_DATE;
```

---

## Getting Help

1. **Check this document** - Most issues are covered
2. **Review logs** - Terminal output has error messages
3. **Check documentation** - README, DEPLOYMENT, API files
4. **Verify setup** - Follow DEPLOYMENT.md step by step
5. **Test API directly** - Use curl or Postman to isolate issues
6. **Check environment** - Ensure all .env variables are set

---

## Emergency Fixes

### Clear Everything and Start Fresh
```bash
# Stop dev server (Ctrl+C)

# Remove all caches
rm -rf .next node_modules pnpm-lock.yaml

# Reinstall
pnpm install

# Restart
pnpm dev
```

### Reset Database
```bash
# Backup first!
# Then run migration again
pnpm run migrate
```

### Reset Cookies
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
document.cookie.split(";").forEach((c) => {
  document.cookie = c
    .replace(/^ +/, "")
    .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
});
```

---

**Still stuck?** Check the logs, review this guide, and verify all environment variables are set correctly. Most issues are configuration-related, not code-related.
