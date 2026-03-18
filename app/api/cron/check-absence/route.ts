import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendAbsenceNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    // Verify the cron secret (optional but recommended)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const today = new Date().toISOString().split('T')[0];

    // Get all employees who haven't marked attendance today
    const result = await query(
      `SELECT e.id, e.name, e.email FROM employees e
       WHERE e.role = 'employee'
       AND NOT EXISTS (
         SELECT 1 FROM attendance a 
         WHERE a.employee_id = e.id 
         AND DATE(a.check_in_time) = $1
       )`,
      [today]
    );

    const absentEmployees = result.rows;
    let sentCount = 0;

    // Send emails to absent employees
    for (const emp of absentEmployees) {
      try {
        await sendAbsenceNotification(emp.email, emp.name, today);
        sentCount++;
      } catch (err) {
        console.error(`Failed to send email to ${emp.email}:`, err);
      }
    }

    return NextResponse.json(
      {
        message: 'Absence check completed',
        totalAbsent: absentEmployees.length,
        emailsSent: sentCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Absence check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
