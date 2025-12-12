import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getSessionFromCookie, setSessionCookie } from '@/app/lib/session';
import { getModeratedChannels, refreshAccessToken } from '@/app/lib/twitch';

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  if (!session || session.exp < Date.now() / 1000) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { hunt_id, island_number, villager_id } = body;

    console.log('Add encounter request:', { hunt_id, island_number, villager_id, sessionUserId: session.userId, sessionLogin: session.login });

    if (!hunt_id || !island_number || !villager_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if the hunt belongs to the user or they are a moderator
    const { data: hunt, error: huntError } = await supabase
      .from('hunts')
      .select('twitch_id')
      .eq('hunt_id', hunt_id)
      .single();

    console.log('Hunt check:', { hunt, huntError, huntTwitchId: hunt?.twitch_id, sessionUserIdParsed: parseInt(session.userId) });

    if (huntError || !hunt) {
      return NextResponse.json({ error: 'Hunt not found' }, { status: 404 });
    }

    const isOwner = hunt.twitch_id === parseInt(session.userId);
    let isModerator = false;
    if (!isOwner && session.accessToken) {
      try {
        const mods = await getModeratedChannels(session.accessToken, session.userId);
        isModerator = mods.some((m) => m.broadcaster_id === String(hunt.twitch_id));
        console.log('Official moderator check:', { isModerator, modsCount: mods.length });
      } catch (err) {
        console.log('Official moderator check error:', err);
      }
    }

    // Check if user is a temporary moderator
    let isTempMod = false;
    if (!isOwner && !isModerator && session.userId) {
      const serviceSupabase = createServiceClient(cookieStore);
      const { data: tempModData } = await serviceSupabase
        .from('temp_mods')
        .select('temp_mod_twitch_id')
        .eq('creator_twitch_id', hunt.twitch_id)
        .eq('temp_mod_twitch_id', parseInt(session.userId))
        .gt('expiry_timestamp', new Date().toISOString())
        .maybeSingle();
      
      isTempMod = !!tempModData;
      console.log('Temp mod check:', { isTempMod, tempModData });
    }

    if (!isOwner && !isModerator && !isTempMod) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Insert encounter
    const { error } = await supabase
      .from('encounters')
      .insert({
        hunt_id,
        island_number: parseInt(island_number),
        villager_id: parseInt(villager_id),
        created_id: session.login,
      });

    console.log('Insert result:', { error });

    if (error) {
      // Check if it's a unique constraint violation (duplicate island number)
      if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
        return NextResponse.json({ 
          error: `An encounter already exists for island ${island_number}` 
        }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to add encounter' }, { status: 500 });
    }

    // Broadcast update to WebSocket server
    try {
      await fetch('https://villagerhunt-websocket.fly.dev/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room: hunt.twitch_id.toString(),
          payload: { action: 'encounter_added', encounter: { hunt_id, island_number, villager_id } },
        }),
      });
    } catch (broadcastError) {
      console.error('Failed to broadcast encounter add:', broadcastError);
      // Don't fail the request if broadcast fails
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Add encounter error:', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}