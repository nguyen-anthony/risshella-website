import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getSessionFromCookie } from '@/app/lib/session';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const session = await getSessionFromCookie();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { hunt_id, island_number, villager_id } = body;

    console.log('Add encounter request:', { hunt_id, island_number, villager_id, sessionUserId: session.userId, sessionLogin: session.login });

    if (!hunt_id || !island_number || !villager_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if the hunt belongs to the user
    const { data: hunt, error: huntError } = await supabase
      .from('hunts')
      .select('twitch_id')
      .eq('hunt_id', hunt_id)
      .single();

    console.log('Hunt check:', { hunt, huntError, huntTwitchId: hunt?.twitch_id, sessionUserIdParsed: parseInt(session.userId) });

    if (huntError || !hunt || hunt.twitch_id !== parseInt(session.userId)) {
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
      return NextResponse.json({ error: 'Failed to add encounter' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Add encounter error:', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}