import { NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/app/lib/session';

export async function GET() {
  const session = await getSessionFromCookie();
  return NextResponse.json({
    loggedIn: !!session,
    user: session ? { id: session.userId, login: session.login } : null,
  });
}
