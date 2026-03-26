import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminCheck = await query<{ role: string }>('SELECT role FROM employees WHERE id = $1', [user.id]);
    if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const today = new Date().toISOString().split('T')[0];

    const result = await query(
      `SELECT 
        e.id, 
        e.name, 
        e.email,
        e.role,
        CASE WHEN a.id IS NOT NULL THEN true ELSE false END as marked,
        a.marked_at as check_in_time
       FROM employees e
       LEFT JOIN attendance a ON e.id = a.employee_id AND a.attendance_date = $1
       WHERE e.role != 'admin'
       ORDER BY e.name ASC`,
      [today]
    );

    return NextResponse.json({ attendance: result.rows }, { status: 200 });
  } catch (error: unknown) {
    console.error('Get attendance error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}