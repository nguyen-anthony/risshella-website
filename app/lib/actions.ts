'use server';

import { cookies } from 'next/headers';
import { refreshAccessToken } from './twitch';
import { decodeSession, encodeSession, type Session } from './session';

const COOKIE_NAME = 'vh_session';

/**
 * Server Action to refresh an expired session token.
 * Returns the updated session or null if refresh fails.
 */
export async function refreshSessionToken(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  const session = await decodeSession(token);
  
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
      
      // Update the cookie
      const updatedToken = await encodeSession(session);
      const maxAge = 30 * 24 * 60 * 60; // 30 days
      store.set(COOKIE_NAME, updatedToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        maxAge,
      });
      
      return session;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    }
  }

  // Session is still valid
  return session;
}
