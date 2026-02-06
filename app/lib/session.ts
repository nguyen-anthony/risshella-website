// app/lib/session.ts
import { cookies } from 'next/headers';

const COOKIE_NAME = 'vh_session';
const ALGO = 'SHA-256';

export type Session = {
  userId: string;
  login: string;
  accessToken?: string; // Twitch user access token (scoped)
  refreshToken?: string; // Twitch refresh token
  exp: number; // epoch seconds
};

// Base64url encode (without padding)
function base64urlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Base64url decode
function base64urlDecode(str: string): Uint8Array {
  // Add padding if needed
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function sign(payload: string): Promise<string> {
  const secret = process.env.SESSION_SECRET || 'dev-secret-change-me';
  const encoder = new TextEncoder();
  
  // Import the secret key
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: ALGO },
    false,
    ['sign']
  );
  
  // Sign the payload
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  );
  
  return base64urlEncode(signature);
}

export async function encodeSession(s: Session): Promise<string> {
  const encoder = new TextEncoder();
  const payload = base64urlEncode(encoder.encode(JSON.stringify(s)));
  const sig = await sign(payload);
  return `${payload}.${sig}`;
}

export async function decodeSession(token?: string): Promise<Session | null> {
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  
  const expectedSig = await sign(payload);
  if (expectedSig !== sig) return null;
  
  try {
    const jsonBytes = base64urlDecode(payload);
    const json = new TextDecoder().decode(jsonBytes);
    return JSON.parse(json) as Session;
  } catch {
    return null;
  }
}

export async function setSessionCookie(s: Session) {
  const token = await encodeSession(s);
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
  return await decodeSession(token);
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
