// app/lib/session.ts
import crypto from 'crypto';
import { cookies } from 'next/headers';

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
