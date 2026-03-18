import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

interface AttendanceRow {
  id: number;
  marked_at: string;
  check_out_time: string | null;
  task: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const today = new Date().toISOString().split('T')[0];
    const result = await query<AttendanceRow>(
      'SELECT id, marked_at, check_out_time, task FROM attendance WHERE employee_id = $1 AND attendance_date = $2',
      [user.id, today]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ status: 'none' });
    }

    const att = result.rows[0];
    return NextResponse.json({
      status: att.check_out_time ? 'completed' : 'checkedin',
      check_in_time: att.marked_at,
      check_out_time: att.check_out_time,
      task: att.task,
    });
  } catch (error: unknown) {
    console.error('Get attendance error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}