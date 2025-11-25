import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServiceClient } from '@/utils/supabase/server';
import { getSessionFromCookie, setSessionCookie } from '@/app/lib/session';
import { refreshAccessToken } from '@/app/lib/twitch';

export async function POST(req: NextRequest) {
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
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  if (!session || session.exp < Date.now() / 1000) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null) as {
    hunt_name?: string;
    target_villager_id?: number[];
    island_villagers?: number[];
    is_bingo_enabled?: boolean;
  } | null;
  if (!body || !Array.isArray(body.target_villager_id) || body.target_villager_id.length === 0) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  // Validate island_villagers if provided
  if (body.island_villagers && (!Array.isArray(body.island_villagers) || body.island_villagers.length > 9 || !body.island_villagers.every(v => typeof v === 'number'))) {
    return NextResponse.json({ error: 'invalid_island_villagers' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServiceClient(cookieStore);

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
    is_bingo_enabled: body.is_bingo_enabled ?? true,
  };

  const { data, error } = await supabase.from('hunts').insert(insert).select('hunt_id').maybeSingle();
  if (error) {
    return NextResponse.json({ error: 'insert_failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, hunt_id: data?.hunt_id ?? null });
}
