import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { getSessionFromCookie } from '@/app/lib/session';

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null) as {
    hunt_name?: string;
    target_villager_id?: number;
  } | null;
  if (!body || typeof body.target_villager_id !== 'number') {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const villagerId = body.target_villager_id;
  // If hunt_name not provided, fetch villager name for default
  let finalName = body.hunt_name?.trim();
  if (!finalName) {
    const { data: v } = await supabase
      .from('villagers')
      .select('name')
      .eq('villager_id', villagerId)
      .maybeSingle();
    finalName = v?.name ? `Hunt for ${v.name}` : 'Villager Hunt';
  }

  const insert = {
    hunt_name: finalName,
    target_villager_id: villagerId,
    hunt_status: 'ACTIVE',
    twitch_id: Number(session.userId),
  };

  const { data, error } = await supabase.from('hunts').insert(insert).select('hunt_id').maybeSingle();
  if (error) {
    return NextResponse.json({ error: 'insert_failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, hunt_id: data?.hunt_id ?? null });
}
