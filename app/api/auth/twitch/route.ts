import { NextRequest, NextResponse } from 'next/server';
import { getAuthorizeUrl } from '@/app/lib/twitch';
import crypto from 'crypto';

const STATE_COOKIE = 'vh_oauth_state';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const returnPath = url.searchParams.get('return') || '/villagerhunt';

  const nonce = crypto.randomBytes(16).toString('base64url');
  const stateRaw = JSON.stringify({ nonce, returnPath });
  const state = Buffer.from(stateRaw).toString('base64url');

  const res = NextResponse.redirect(getAuthorizeUrl(state));
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60, // 10 minutes
  });
  return res;
}
