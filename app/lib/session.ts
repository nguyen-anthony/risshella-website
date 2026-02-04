// app/lib/session.ts
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { refreshAccessToken } from './twitch';

const COOKIE_NAME = 'vh_session';
const ALGO = 'sha256';

export type Session = {
  userId: string;
  login: string;
  accessToken?: string; // Twitch user access token (scoped)
  refreshToken?: string; // Twitch refresh token
  exp: number; // epoch seconds
};

function sign(payload: string) {
  const secret = process.env.SESSION_SECRET || 'dev-secret-change-me';
  const h = crypto.createHmac(ALGO, secret);
  h.update(payload);
  return h.digest('base64url');
}

export function encodeSession(s: Session) {
  const payload = Buffer.from(JSON.stringify(s)).toString('base64url');
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export function decodeSession(token?: string): Session | null {
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  if (sign(payload) !== sig) return null;
  try {
    const json = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return json as Session;
  } catch {
    return null;
  }
}

export async function setSessionCookie(s: Session) {
  const token = encodeSession(s);
  const maxAge = s.exp - Math.floor(Date.now() / 1000);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: Math.max(60, maxAge),
  });
}

export async function getSessionFromCookie(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return decodeSession(token);
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(COOKIE_NAME, '', { path: '/', maxAge: 0 });
}

/**
 * Gets the session and automatically refreshes the token if expired.
 * Returns null if session doesn't exist or refresh fails.
 */
export async function getValidSession(): Promise<Session | null> {
  let session = await getSessionFromCookie();
  
  if (!session) {
    return null;
  }

  // Check if token is expired
  if (session.exp < Date.now() / 1000) {
    // No refresh token available
    if (!session.refreshToken) {
      return null;
    }
    
    // Try to refresh
    try {
      const newToken = await refreshAccessToken(session.refreshToken);
      session.accessToken = newToken.access_token;
      session.refreshToken = newToken.refresh_token;
      session.exp = Math.floor(Date.now() / 1000) + newToken.expires_in;
      await setSessionCookie(session);
      // Session successfully refreshed - return updated session
      return session;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    }
  }

  // Session is still valid
  return session;
}
