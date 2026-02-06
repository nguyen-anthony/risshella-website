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
  // Cookie lasts 30 days - allows silent token refresh while maintaining reasonable security
  // Access token inside expires sooner (~4 hours from Twitch) and will be auto-refreshed
  const maxAge = 30 * 24 * 60 * 60; // 30 days
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge,
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
 * Gets the session from cookie without any modifications.
 * Returns null if session doesn't exist or is expired.
 * 
 * Note: This function is read-only and won't refresh expired tokens.
 * For token refresh, use the refreshSessionToken Server Action from app/lib/actions.ts
 */
export async function getValidSession(): Promise<Session | null> {
  const session = await getSessionFromCookie();
  
  if (!session) {
    return null;
  }

  // Check if token is expired - return null if so
  // (refresh must be done via Server Action, not in page rendering)
  if (session.exp < Date.now() / 1000) {
    return null;
  }

  // Session is still valid
  return session;
}
