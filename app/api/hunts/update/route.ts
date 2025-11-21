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
    hunt_id?: string;
    island_villagers?: number[];
    target_villager_id?: number[];
  } | null;

  if (!body || typeof body.hunt_id !== 'string') {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  const hasIslandVillagers = Array.isArray(body.island_villagers);
  const hasTargetVillagers = Array.isArray(body.target_villager_id);

  if (!hasIslandVillagers && !hasTargetVillagers) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  // Validate island_villagers if provided
  if (hasIslandVillagers && (body.island_villagers!.some(v => typeof v !== 'number') || body.island_villagers!.length > 9)) {
    return NextResponse.json({ error: 'invalid_island_villagers' }, { status: 400 });
  }

  // Validate target_villager_id if provided
  if (hasTargetVillagers && body.target_villager_id!.some(v => typeof v !== 'number')) {
    return NextResponse.json({ error: 'invalid_target_villager_id' }, { status: 400 });
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
  const updateData: { island_villagers?: number[]; target_villager_id?: number[] } = {};
  if (hasIslandVillagers) {
    updateData.island_villagers = body.island_villagers;
  }
  if (hasTargetVillagers) {
    updateData.target_villager_id = body.target_villager_id;
  }

  const { error } = await supabase
    .from('hunts')
    .update(updateData)
    .eq('hunt_id', body.hunt_id);

  if (error) {
    return NextResponse.json({ error: 'update_failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}