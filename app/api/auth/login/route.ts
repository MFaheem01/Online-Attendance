import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword, createSession, hashPassword } from '@/lib/auth';

const ADMIN_EMAIL = 'my7227164@gmail.com';
const ADMIN_PASSWORD = 'Faheem@123';

export async function POST(request: NextRequest) {
  try {
    const { emailOrUsername, password } = await request.json();

    if (!emailOrUsername || !password) {
      return NextResponse.json(
        { error: 'Email/username and password are required' },
        { status: 400 }
      );
    }

    // Admin hardcoded check — pehle check karo
    if (emailOrUsername === ADMIN_EMAIL || emailOrUsername === 'admin') {
      if (password !== ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      let adminResult = await query('SELECT id FROM employees WHERE email = $1', [ADMIN_EMAIL]);
      if (adminResult.rows.length === 0) {
        const hash = await hashPassword(ADMIN_PASSWORD);
        await query(
          'INSERT INTO employees (email, name, username, password_hash, role, is_verified) VALUES ($1, $2, $3, $4, $5, true)',
          [ADMIN_EMAIL, 'Admin', 'admin', hash, 'admin']
        );
        adminResult = await query('SELECT id FROM employees WHERE email = $1', [ADMIN_EMAIL]);
      }

      // Make sure role is admin in DB
      await query('UPDATE employees SET role = $1 WHERE email = $2', ['admin', ADMIN_EMAIL]);

      const sessionId = await createSession(adminResult.rows[0].id);
      const response = NextResponse.json({ message: 'Login successful', role: 'admin' }, { status: 200 });
      response.cookies.set('session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
      });
      return response;
    }

    // Normal employee login
    const isEmail = emailOrUsername.includes('@');
    const result = await query(
      isEmail
        ? 'SELECT id, email, name, username, password_hash, role, is_verified FROM employees WHERE email = $1'
        : 'SELECT id, email, name, username, password_hash, role, is_verified FROM employees WHERE username = $1',
      [emailOrUsername]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const employee = result.rows[0];

    if (!employee.is_verified) {
      return NextResponse.json({ error: 'Please verify your email first' }, { status: 403 });
    }

    if (employee.role === 'admin') {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const passwordMatch = await verifyPassword(password, employee.password_hash);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const sessionId = await createSession(employee.id);
    const response = NextResponse.json(
      { message: 'Login successful', role: employee.role },
      { status: 200 }
    );
    response.cookies.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
    });
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}