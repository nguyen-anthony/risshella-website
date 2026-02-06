import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseMiddlewareClient } from '@/utils/supabase/middleware';
import { decodeSession, encodeSession, type Session } from '@/app/lib/session';

const COOKIE_NAME = 'vh_session';

/**
 * Refreshes the Twitch access token if it's expired.
 * Returns updated response with refreshed session cookie, or original response if refresh fails/not needed.
 */
async function refreshSessionIfNeeded(request: NextRequest, response: NextResponse): Promise<NextResponse> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = decodeSession(token);

  if (!session) {
    return response;
  }

  // Check if token is expired (with 5-minute buffer to avoid edge cases)
  const isExpired = session.exp < Date.now() / 1000 - 300;
  
  if (!isExpired || !session.refreshToken) {
    return response;
  }

  // Try to refresh the token
  try {
    const refreshResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.TWITCH_CLIENT_ID!,
        client_secret: process.env.TWITCH_CLIENT_SECRET!,
        refresh_token: session.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!refreshResponse.ok) {
      console.error('Token refresh failed:', refreshResponse.status);
      return response;
    }

    const newToken = await refreshResponse.json() as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };

    // Update session with new tokens
    const updatedSession: Session = {
      ...session,
      accessToken: newToken.access_token,
      refreshToken: newToken.refresh_token,
      exp: Math.floor(Date.now() / 1000) + newToken.expires_in,
    };

    // Set the updated session cookie on the response
    const updatedToken = encodeSession(updatedSession);
    const maxAge = 30 * 24 * 60 * 60; // 30 days
    
    response.cookies.set(COOKIE_NAME, updatedToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    console.log('Token refreshed successfully in middleware');
  } catch (error) {
    console.error('Error refreshing token in middleware:', error);
  }

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const lowercasedPath = pathname.toLowerCase();

  // Preserve existing lowercase redirect behavior globally
  if (pathname !== lowercasedPath) {
    // Preserve existing search params while normalizing the path to lowercase
    const url = request.nextUrl.clone();
    url.pathname = lowercasedPath;
    return NextResponse.redirect(url);
  }

  // Only initialize Supabase session middleware for the villagerhunt section
  if (lowercasedPath.startsWith('/villagerhunt')) {
    let response = createSupabaseMiddlewareClient(request);
    
    // Refresh Twitch token if needed
    response = await refreshSessionIfNeeded(request, response);
    
    return response;
  }

  return NextResponse.next();
}
