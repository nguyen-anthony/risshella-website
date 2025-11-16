import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookie, setSessionCookie } from '@/app/lib/session';
import { getModeratedChannels, refreshAccessToken } from '@/app/lib/twitch';

export async function GET(req: NextRequest, { params }: { params: Promise<{ twitchId: string }> }) {
  const { twitchId } = await params;
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
    const isModerator = mods.some((m) => m.broadcaster_id === twitchId);
    return NextResponse.json({ isModerator });
  } catch (error) {
    console.error('Error checking moderator:', error);
    return NextResponse.json({ isModerator: false }, { status: 500 });
  }
}