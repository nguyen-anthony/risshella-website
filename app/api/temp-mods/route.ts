import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServiceClient } from '@/utils/supabase/server';
import { getSessionFromCookie } from '@/app/lib/session';

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServiceClient(cookieStore);

  const { searchParams } = new URL(req.url);
  const creatorTwitchId = searchParams.get('creatorTwitchId');

  if (!creatorTwitchId) {
    return NextResponse.json({ error: 'creatorTwitchId is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('temp_mods')
    .select('temp_mod_twitch_id, temp_mod_username, expiry_timestamp')
    .eq('creator_twitch_id', creatorTwitchId)
    .gt('expiry_timestamp', new Date().toISOString());

  if (error) {
    console.error('Error fetching temp mods:', error);
    return NextResponse.json({ error: 'Failed to fetch temp mods' }, { status: 500 });
  }

  return NextResponse.json({ tempMods: data });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || !body.creatorTwitchId || !body.username || !body.expiryTimestamp) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { creatorTwitchId, username, expiryTimestamp } = body;

  // Verify the session user is the creator
  if (Number(session.userId) !== creatorTwitchId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 403 });
  }

  try {
    // Validate Twitch username using Twitch API
    const twitchResponse = await fetch(`https://api.twitch.tv/helix/users?login=${encodeURIComponent(username)}`, {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID!,
        'Authorization': `Bearer ${session.accessToken}`,
      },
    });

    if (!twitchResponse.ok) {
      return NextResponse.json({ error: 'Failed to validate Twitch username' }, { status: 500 });
    }

    const twitchData = await twitchResponse.json();
    
    if (!twitchData.data || twitchData.data.length === 0) {
      return NextResponse.json({ error: 'Twitch user not found' }, { status: 400 });
    }

    if (twitchData.data.length > 1) {
      return NextResponse.json({ error: 'Multiple users found with that username' }, { status: 400 });
    }

    const twitchUser = twitchData.data[0];
    const tempModTwitchId = Number(twitchUser.id);

    // Insert into temp_mods table
    const cookieStore = await cookies();
    const supabase = createServiceClient(cookieStore);

    const { error: insertError } = await supabase
      .from('temp_mods')
      .insert({
        creator_twitch_id: creatorTwitchId,
        temp_mod_twitch_id: tempModTwitchId,
        temp_mod_username: username,
        expiry_timestamp: expiryTimestamp,
      });

    if (insertError) {
      console.error('Error inserting temp mod:', insertError);
      return NextResponse.json({ error: 'Failed to add temp mod' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding temp mod:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServiceClient(cookieStore);
  const session = await getSessionFromCookie();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { tempModTwitchId, expiryTimestamp, creatorTwitchId } = body;

    if (!tempModTwitchId || !expiryTimestamp || !creatorTwitchId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the session user is the creator
    if (parseInt(session.userId) !== creatorTwitchId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update the temp mod expiry
    const { error } = await supabase
      .from('temp_mods')
      .update({ expiry_timestamp: expiryTimestamp })
      .eq('creator_twitch_id', creatorTwitchId)
      .eq('temp_mod_twitch_id', tempModTwitchId);

    if (error) {
      console.error('Error updating temp mod:', error);
      return NextResponse.json({ error: 'Failed to update temp mod' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating temp mod:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServiceClient(cookieStore);
  const session = await getSessionFromCookie();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const tempModTwitchId = searchParams.get('tempModTwitchId');
    const creatorTwitchId = searchParams.get('creatorTwitchId');

    if (!tempModTwitchId || !creatorTwitchId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Verify the session user is the creator
    if (parseInt(session.userId) !== parseInt(creatorTwitchId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete the temp mod
    const { error } = await supabase
      .from('temp_mods')
      .delete()
      .eq('creator_twitch_id', creatorTwitchId)
      .eq('temp_mod_twitch_id', tempModTwitchId);

    if (error) {
      console.error('Error deleting temp mod:', error);
      return NextResponse.json({ error: 'Failed to delete temp mod' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting temp mod:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}