import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from './auth';

export async function withAuth(request: NextRequest) {
  return getSessionUser(request);
}

export async function requireAuth(request: NextRequest) {
  const user = await getSessionUser(request);

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return user;
}

export async function requireAdmin(request: NextRequest) {
  const user = await getSessionUser(request);

  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden - Admin access required' },
      { status: 403 }
    );
  }

  return user;
}
