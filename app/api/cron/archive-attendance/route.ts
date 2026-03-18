import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Verify the cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the first day of current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthEnd = new Date(firstDayOfMonth.getTime() - 1);
    const lastMonthStart = new Date(lastMonthEnd.getFullYear(), lastMonthEnd.getMonth(), 1);

    // Archive last month's attendance
    const archiveResult = await query(
      `INSERT INTO attendance_archive (employee_id, check_in_time, month, year)
       SELECT employee_id, check_in_time, EXTRACT(MONTH FROM check_in_time)::INT, EXTRACT(YEAR FROM check_in_time)::INT
       FROM attendance
       WHERE DATE(check_in_time) >= $1 AND DATE(check_in_time) < $2
       ON CONFLICT (employee_id, month, year) DO NOTHING`,
      [lastMonthStart.toISOString().split('T')[0], firstDayOfMonth.toISOString().split('T')[0]]
    );

    // Delete archived records from active attendance table
    const deleteResult = await query(
      `DELETE FROM attendance
       WHERE DATE(check_in_time) >= $1 AND DATE(check_in_time) < $2`,
      [lastMonthStart.toISOString().split('T')[0], firstDayOfMonth.toISOString().split('T')[0]]
    );

    return NextResponse.json(
      {
        message: 'Attendance archival completed',
        archivedRecords: archiveResult.rowCount,
        deletedRecords: deleteResult.rowCount,
        period: `${lastMonthStart.toISOString().split('T')[0]} to ${lastMonthEnd.toISOString().split('T')[0]}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Archive error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
