import { NextRequest, NextResponse, after } from 'next/server';
import { createClient as createSupabaseMiddlewareClient } from '@/utils/supabase/middleware';
import { decodeSession, encodeSession, type Session } from '@/app/lib/session';
import { refreshAccessToken, getTwitchUser } from '@/app/lib/twitch';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const COOKIE_NAME = 'vh_session';

/**
 * Refreshes the Twitch access token if it's expired.
 * Returns updated response with refreshed session cookie, or original response if refresh fails/not needed.
 */
async function refreshSessionIfNeeded(request: NextRequest, response: NextResponse): Promise<NextResponse> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = await decodeSession(token);

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
    const newToken = await refreshAccessToken(session.refreshToken);

    // Update session with new tokens
    const updatedSession: Session = {
      ...session,
      accessToken: newToken.access_token,
      refreshToken: newToken.refresh_token,
      exp: Math.floor(Date.now() / 1000) + newToken.expires_in,
    };

    // Set the updated session cookie on the response
    const updatedToken = await encodeSession(updatedSession);
    const maxAge = 30 * 24 * 60 * 60; // 30 days
    
    response.cookies.set(COOKIE_NAME, updatedToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge,
    });

    console.log('Token refreshed successfully in middleware');

    // Best-effort avatar sync — runs after the response is sent
    after(async () => {
      try {
        const user = await getTwitchUser(newToken.access_token);
        if (!user) return;
        const supabase = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
        );
        await supabase
          .from('creators')
          .update({
            avatar_url: user.profile_image_url,
            display_name: user.display_name,
            twitch_username: user.login,
          })
          .eq('twitch_id', parseInt(session.userId));
      } catch {
        // Ignore — best-effort only
      }
    });
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
