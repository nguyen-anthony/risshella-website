import { NextRequest, NextResponse } from 'next/server';
import { getStreams } from '@/app/lib/twitch';

const ACNH_GAME_ID = '509538';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { twitchId } = body;

    if (!twitchId) {
      return NextResponse.json({ error: 'Missing twitchId' }, { status: 400 });
    }

    // Check if the user is live streaming ACNH
    const streams = await getStreams([twitchId.toString()], ACNH_GAME_ID);
    const isLive = streams.length > 0;

    return NextResponse.json(
      { isLive },
      {
        headers: {
          // Cache for 3 minutes to reduce Twitch API calls
          'Cache-Control': 'public, max-age=180, s-maxage=180',
        },
      }
    );
  } catch (error) {
    console.error('Error checking stream status:', error);
    return NextResponse.json({ isLive: false });
  }
}
