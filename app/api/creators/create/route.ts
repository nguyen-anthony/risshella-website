import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getSessionFromCookie } from '@/app/lib/session';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServiceClient(cookieStore);
  const session = await getSessionFromCookie();

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch user data from Twitch
  const twitchResponse = await fetch(`https://api.twitch.tv/helix/users?id=${session.userId}`, {
    headers: {
      'Client-Id': process.env.TWITCH_CLIENT_ID!,
      'Authorization': `Bearer ${session.accessToken}`,
    },
  });

  if (!twitchResponse.ok) {
    return NextResponse.json({ error: 'Failed to fetch Twitch user data' }, { status: 500 });
  }

  const twitchData = await twitchResponse.json();
  const user = twitchData.data[0];

  if (!user) {
    return NextResponse.json({ error: 'User not found on Twitch' }, { status: 404 });
  }

  // Insert into creators table
  const { error } = await supabase
    .from('creators')
    .insert({
      twitch_id: parseInt(user.id),
      twitch_username: user.login,
      display_name: user.display_name,
      avatar_url: user.profile_image_url,
    });

  if (error) {
    return NextResponse.json({ error: 'Failed to create creator' }, { status: 500 });
  }

  // Redirect back to villagerhunt
  return NextResponse.redirect(new URL('/villagerhunt', request.url));
}