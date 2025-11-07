import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, getTwitchUser } from '@/app/lib/twitch';
import { setSessionCookie } from '@/app/lib/session';

const STATE_COOKIE = 'vh_oauth_state';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const origin = url.origin;

  if (error) {
    const dest = new URL(`/villagerhunt?auth=error&reason=${encodeURIComponent(error)}`, origin);
    return NextResponse.redirect(dest);
  }

  const stateCookie = req.cookies.get(STATE_COOKIE)?.value;
  if (!code || !state || !stateCookie || state !== stateCookie) {
    const dest = new URL('/villagerhunt?auth=failed', origin);
    return NextResponse.redirect(dest);
  }

  // decode state to get optional return path
  let returnPath = '/villagerhunt';
  try {
    const parsed = JSON.parse(Buffer.from(state, 'base64url').toString());
    if (parsed?.returnPath) returnPath = parsed.returnPath;
  } catch {
    // ignore parse errors, use default returnPath
  }

  try {
  const token = await exchangeCodeForToken(code);
  const user = await getTwitchUser(token.access_token);
    if (!user) {
      const dest = new URL('/villagerhunt?auth=failed', origin);
      return NextResponse.redirect(dest);
    }

    // Create a short-lived session for now (6 hours)
    const exp = Math.floor(Date.now() / 1000) + 6 * 60 * 60;
  await setSessionCookie({ userId: user.id, login: user.login, accessToken: token.access_token, exp });

    const absoluteReturn = /^https?:\/\//i.test(returnPath)
      ? returnPath
      : new URL(`${returnPath}?auth=success`, origin).toString();
    const res = NextResponse.redirect(absoluteReturn);
    res.cookies.delete(STATE_COOKIE);
    return res;
  } catch {
    const dest = new URL('/villagerhunt?auth=failed', origin);
    return NextResponse.redirect(dest);
  }
}
