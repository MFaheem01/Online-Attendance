import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import { query } from './db';
import { NextRequest } from 'next/server';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Generate a 6-digit verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

// Create verification code in database
export async function createVerificationCode(email: string): Promise<string> {
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await query(
    `INSERT INTO verification_codes (email, code, expires_at) 
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET code = $2, expires_at = $3`,
    [email, code, expiresAt.toISOString()]
  );

  return code;
}

// Verify code and get email
export async function verifyCode(email: string, code: string): Promise<boolean> {
  const result = await query(
    `SELECT * FROM verification_codes WHERE email = $1 AND code = $2 AND expires_at > NOW()`,
    [email, code]
  );

  if (result.rows.length === 0) return false;

  // Delete the used code
  await query(`DELETE FROM verification_codes WHERE email = $1`, [email]);

  return true;
}

// Mark employee as verified
export async function markEmployeeAsVerified(email: string): Promise<void> {
  await query(
    `UPDATE employees SET is_verified = true WHERE email = $1`,
    [email]
  );
}

// Create session
export async function createSession(employeeId: string): Promise<string> {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await query(
    `INSERT INTO sessions (id, employee_id, expires_at) VALUES ($1, $2, $3)`,
    [sessionId, employeeId, expiresAt.toISOString()]
  );

  return sessionId;
}

// Get session user
export async function getSessionUser(request: NextRequest): Promise<SessionUser | null> {
  const sessionId = request.cookies.get('session_id')?.value;

  if (!sessionId) return null;

  try {
    const result = await query<SessionUser>(
      `SELECT e.id, e.email, e.name, e.role 
       FROM employees e
       INNER JOIN sessions s ON e.id = s.employee_id
       WHERE s.id = $1 AND s.expires_at > NOW()`,
      [sessionId]
    );

    if (result.rows.length === 0) return null;

    return {
      id: result.rows[0].id,
      email: result.rows[0].email,
      name: result.rows[0].name,
      role: result.rows[0].role,
    };
  } catch (error: unknown) {
    console.error('Error getting session user:', error instanceof Error ? error.message : error);
    return null;
  }
}

// Delete session
export async function deleteSession(sessionId: string): Promise<void> {
  await query(`DELETE FROM sessions WHERE id = $1`, [sessionId]);
}
