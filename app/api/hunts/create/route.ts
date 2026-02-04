import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServiceClient } from '@/utils/supabase/server';
import { getValidSession } from '@/app/lib/session';

export async function POST(req: NextRequest) {
  const session = await getValidSession();

  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null) as {
    hunt_name?: string;
    target_villager_id?: number[];
    island_villagers?: number[];
    hotel_tourists?: number[];
    is_bingo_enabled?: boolean;
    bingo_card_size?: number;
  } | null;
  if (!body || !Array.isArray(body.target_villager_id) || body.target_villager_id.length === 0) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  // Validate island_villagers if provided
  if (body.island_villagers && (!Array.isArray(body.island_villagers) || body.island_villagers.length > 9 || !body.island_villagers.every(v => typeof v === 'number'))) {
    return NextResponse.json({ error: 'invalid_island_villagers' }, { status: 400 });
  }

  // Validate hotel_tourists if provided
  if (body.hotel_tourists && (!Array.isArray(body.hotel_tourists) || body.hotel_tourists.length > 9 || !body.hotel_tourists.every(v => typeof v === 'number'))) {
    return NextResponse.json({ error: 'invalid_hotel_tourists' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServiceClient(cookieStore);

  // Check if user already has an active hunt
  const { data: existingActiveHunt } = await supabase
    .from('hunts')
    .select('hunt_id')
    .eq('twitch_id', Number(session.userId))
    .in('hunt_status', ['ACTIVE', 'INACTIVE'])
    .maybeSingle();

  if (existingActiveHunt) {
    return NextResponse.json({ error: 'Active Hunt Already Exists' }, { status: 409 });
  }

  const villagerIds = body.target_villager_id;
  // If hunt_name not provided, fetch villager names for default
  let finalName = body.hunt_name?.trim();
  if (!finalName) {
    const { data: villagers } = await supabase
      .from('villagers')
      .select('name')
      .in('villager_id', villagerIds);
    if (villagers && villagers.length > 0) {
      const names = villagers.map(v => v.name).join(', ');
      finalName = villagers.length === 1 ? `Hunt for ${names}` : `Hunt for ${names}`;
    } else {
      finalName = 'Villager Hunt';
    }
  }

  const insert = {
    hunt_name: finalName,
    target_villager_id: villagerIds,
    hunt_status: 'ACTIVE',
    twitch_id: Number(session.userId),
    island_villagers: body.island_villagers || [],
    hotel_tourists: body.hotel_tourists || [],
    is_bingo_enabled: body.is_bingo_enabled ?? true,
    bingo_card_size: body.bingo_card_size ?? 5,
  };

  const { data, error } = await supabase.from('hunts').insert(insert).select('hunt_id').maybeSingle();
  if (error) {
    return NextResponse.json({ error: 'insert_failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, hunt_id: data?.hunt_id ?? null });
}
