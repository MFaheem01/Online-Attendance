import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

async function checkAdmin(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) return null;
  const result = await query<{ role: string }>('SELECT role FROM employees WHERE id = $1', [user.id]);
  if (result.rows.length === 0 || result.rows[0].role !== 'admin') return null;
  return user;
}

export async function GET(request: NextRequest) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const result = await query(
      `SELECT e.id, e.name, e.email, e.role, e.created_at,
              COUNT(a.id) as total_attendance,
              MAX(a.marked_at) as last_attendance
       FROM employees e
       LEFT JOIN attendance a ON e.id = a.employee_id
       WHERE e.role != 'admin'
       GROUP BY e.id, e.name, e.email, e.role, e.created_at
       ORDER BY e.created_at DESC`
    );

    return NextResponse.json({ employees: result.rows }, { status: 200 });
  } catch (error: unknown) {
    console.error('Get employees error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Employee ID required' }, { status: 400 });

    await query('DELETE FROM employees WHERE id = $1 AND role != $2', [id, 'admin']);

    return NextResponse.json({ message: 'Employee deleted successfully' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Delete employee error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}