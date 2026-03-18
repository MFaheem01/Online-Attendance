import { NextRequest, NextResponse } from 'next/server';
import { createVerificationCode, hashPassword } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, name, password, username } = await request.json();

    if (!email || !name || !password || !username) {
      return NextResponse.json(
        { error: 'All fields are required including username' },
        { status: 400 }
      );
    }

    // Username validation — lowercase letters, numbers, underscore only
    const usernameRegex = /^[a-z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: 'Username must be 3-20 characters, lowercase letters, numbers or underscore only' },
        { status: 400 }
      );
    }

    // Password validation — min 6 chars, 1 uppercase, 1 number
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters with 1 uppercase letter and 1 number' },
        { status: 400 }
      );
    }

    // Check username already taken
    const existingUsername = await query<{ id: number }>(
      'SELECT id FROM employees WHERE username = $1',
      [username]
    );
    if (existingUsername.rows.length > 0) {
      return NextResponse.json(
        { error: 'Username already taken, please choose another' },
        { status: 409 }
      );
    }

    // Check email already exists
    const existingResult = await query<{ id: number, is_verified: boolean }>(
      'SELECT id, is_verified FROM employees WHERE email = $1',
      [email]
    );

    if (existingResult.rows.length > 0) {
      if (existingResult.rows[0].is_verified) {
        return NextResponse.json(
          { error: 'Employee with this email already exists' },
          { status: 409 }
        );
      }
      await query('DELETE FROM employees WHERE email = $1', [email]);
    }

    const passwordHash = await hashPassword(password);

    await query(
      'INSERT INTO employees (email, name, username, password_hash, role, is_verified) VALUES ($1, $2, $3, $4, $5, false)',
      [email, name, username, passwordHash, 'employee']
    );

    const code = await createVerificationCode(email);
    await sendVerificationEmail(email, code);

    return NextResponse.json(
      { message: 'Verification code sent to email', email },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Register error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}