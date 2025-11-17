import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServiceClient } from '@/utils/supabase/server';
import { getSessionFromCookie } from '@/app/lib/session';

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null) as {
    hunt_id?: string;
    island_villagers?: number[];
  } | null;

  if (!body || typeof body.hunt_id !== 'string' || !Array.isArray(body.island_villagers)) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  // Validate island_villagers
  if (body.island_villagers.some(v => typeof v !== 'number') || body.island_villagers.length > 9) {
    return NextResponse.json({ error: 'invalid_island_villagers' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServiceClient(cookieStore);

  // Verify the user owns this hunt
  const { data: hunt } = await supabase
    .from('hunts')
    .select('twitch_id')
    .eq('hunt_id', body.hunt_id)
    .eq('hunt_status', 'ACTIVE')
    .maybeSingle();

  if (!hunt || hunt.twitch_id !== Number(session.userId)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 403 });
  }

  // Update the hunt
  const { error } = await supabase
    .from('hunts')
    .update({ island_villagers: body.island_villagers })
    .eq('hunt_id', body.hunt_id);

  if (error) {
    return NextResponse.json({ error: 'update_failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}