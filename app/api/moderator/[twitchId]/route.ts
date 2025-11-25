import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionFromCookie, setSessionCookie } from '@/app/lib/session';
import { getModeratedChannels, refreshAccessToken } from '@/app/lib/twitch';
import { createClient, createServiceClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ twitchId: string }> }) {
  const { twitchId } = await params;
  const cookieStore = await cookies();
  const session = await getSessionFromCookie();

  if (!session || !session.accessToken) {
    return NextResponse.json({ isModerator: false }, { status: 401 });
  }

  // Refresh token if expired
  if (session.exp < Date.now() / 1000 && session.refreshToken) {
    try {
      const newToken = await refreshAccessToken(session.refreshToken);
      session.accessToken = newToken.access_token;
      session.refreshToken = newToken.refresh_token;
      session.exp = Math.floor(Date.now() / 1000) + newToken.expires_in;
      await setSessionCookie(session);
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return NextResponse.json({ isModerator: false }, { status: 401 });
    }
  }

  try {
    const mods = await getModeratedChannels(session.accessToken, session.userId);
    let isModerator = mods.some((m) => m.broadcaster_id === twitchId);

    // Check if user is a temporary moderator
    const serviceSupabase = createServiceClient(cookieStore);
    const { data: tempModData } = await serviceSupabase
      .from('temp_mods')
      .select('temp_mod_twitch_id')
      .eq('creator_twitch_id', parseInt(twitchId))
      .eq('temp_mod_twitch_id', parseInt(session.userId))
      .gt('expiry_timestamp', new Date().toISOString())
      .maybeSingle();

    if (tempModData) {
      isModerator = true;
    }

    return NextResponse.json({ isModerator });
  } catch (error) {
    console.error('Error checking moderator:', error);
    return NextResponse.json({ isModerator: false }, { status: 500 });
  }
}