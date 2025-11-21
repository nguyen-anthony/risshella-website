import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getSessionFromCookie, setSessionCookie } from '@/app/lib/session';
import { refreshAccessToken } from '@/app/lib/twitch';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServiceClient(cookieStore);
  const session = await getSessionFromCookie();

  // Refresh token if expired
  if (session && session.exp < Date.now() / 1000 && session.refreshToken) {
    try {
      const newToken = await refreshAccessToken(session.refreshToken);
      session.accessToken = newToken.access_token;
      session.refreshToken = newToken.refresh_token;
      session.exp = Math.floor(Date.now() / 1000) + newToken.expires_in;
      await setSessionCookie(session);
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // If refresh fails, treat as unauthorized
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  if (!session || session.exp < Date.now() / 1000) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const huntId = formData.get('hunt_id') as string;

  if (!huntId) {
    return NextResponse.json({ error: 'Hunt ID required' }, { status: 400 });
  }

  // Get creator
  const { data: creator, error: creatorError } = await supabase
    .from('creators')
    .select('twitch_id')
    .ilike('twitch_username', session.login)
    .maybeSingle();

  if (creatorError || !creator) {
    return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
  }

  // Verify hunt belongs to creator
  const { data: hunt, error: huntError } = await supabase
    .from('hunts')
    .select('twitch_id')
    .eq('hunt_id', huntId)
    .maybeSingle();

  if (huntError || !hunt || hunt.twitch_id !== creator.twitch_id) {
    return NextResponse.json({ error: 'Hunt not found or access denied' }, { status: 404 });
  }

  // Update hunt to ABANDONED
  const { error: updateError } = await supabase
    .from('hunts')
    .update({ hunt_status: 'ABANDONED', complete_ts: new Date().toISOString() })
    .eq('hunt_id', huntId);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to abandon hunt' }, { status: 500 });
  }

  // Redirect back to the hunt page
  return NextResponse.redirect(new URL(`/villagerhunt/${encodeURIComponent(session.login)}`, request.url));
}