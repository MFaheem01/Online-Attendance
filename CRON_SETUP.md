# Scheduled Jobs Setup

This attendance system includes two automated scheduled jobs that need to be configured with an external cron service.

## Prerequisites

Set the `CRON_SECRET` environment variable in your project settings. This is used to authorize cron requests.

## Cron Jobs

### 1. Absence Detection (`/api/cron/check-absence`)

Checks for employees who haven't marked attendance today and sends them reminder emails.

**Recommended Schedule:** Daily at 5 PM (17:00)

**Curl Example:**
```bash
curl -X POST https://your-domain.com/api/cron/check-absence \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "message": "Absence check completed",
  "totalAbsent": 5,
  "emailsSent": 5
}
```

### 2. Monthly Attendance Archive (`/api/cron/archive-attendance`)

Archives the previous month's attendance records and deletes them from the active table for performance.

**Recommended Schedule:** First day of month at 12:00 AM (00:00)

**Curl Example:**
```bash
curl -X POST https://your-domain.com/api/cron/archive-attendance \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "message": "Attendance archival completed",
  "archivedRecords": 150,
  "deletedRecords": 150,
  "period": "2024-02-01 to 2024-02-29"
}
```

## Setting Up External Cron Services

### Using Vercel Cron (if available)

Create a `vercel.json` configuration or use Vercel's cron features if available for your plan.

### Using External Services

Popular options:
- **EasyCron**: Free cron service (easycron.com)
- **cron-job.org**: Free cron job service
- **AWS CloudWatch Events**: Enterprise solution
- **Google Cloud Scheduler**: Enterprise solution

## Testing

You can test the cron jobs directly:

1. **Test absence detection:**
   ```bash
   curl -X POST http://localhost:3000/api/cron/check-absence \
     -H "Authorization: Bearer test-secret" \
     -H "Content-Type: application/json"
   ```

2. **Test archival:**
   ```bash
   curl -X POST http://localhost:3000/api/cron/archive-attendance \
     -H "Authorization: Bearer test-secret" \
     -H "Content-Type: application/json"
   ```

## Important Notes

- Both endpoints require the `CRON_SECRET` header for security
- Absence detection runs on UTC time
- Monthly archive happens on the first day of each month
- Make sure your `SMTP_*` environment variables are properly configured for email sending
