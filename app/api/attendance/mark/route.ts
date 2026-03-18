import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const { action, task } = body;

    const today = new Date().toISOString().split('T')[0];

    const existing = await query(
      'SELECT id, marked_at, check_out_time FROM attendance WHERE employee_id = $1 AND attendance_date = $2',
      [user.id, today]
    );

    if (!existing.rows.length) {
      if (action !== 'checkin') {
        return NextResponse.json({ error: 'Please check in first' }, { status: 400 });
      }
      const result = await query<{ id: number, marked_at: string, task: string | null }>(
        'INSERT INTO attendance (employee_id, attendance_date, marked_at, task) VALUES ($1, $2, NOW(), $3) RETURNING id, marked_at, task',
        [user.id, today, task || null]
      );
      return NextResponse.json({
        message: 'Checked in successfully',
        attendance: {
          id: result.rows[0].id,
          check_in_time: result.rows[0].marked_at,
          task: result.rows[0].task,
        }
      });
    }

    const att = existing.rows[0] as { id: number, check_out_time: string | null };

    if (action === 'checkout') {
      if (att.check_out_time) {
        return NextResponse.json({ error: 'Already checked out today' }, { status: 400 });
      }
      await query(
        'UPDATE attendance SET check_out_time = NOW() WHERE id = $1',
        [att.id]
      );
      return NextResponse.json({ message: 'Checked out successfully' });
    }

    return NextResponse.json({ error: 'Already checked in today' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Attendance error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}