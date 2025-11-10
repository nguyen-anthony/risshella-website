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
    const { encounter_id, island_number, villager_id } = body;

    if (!encounter_id || !island_number || !villager_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // First, get the encounter to check ownership and get hunt_id
    const { data: encounter, error: fetchError } = await supabase
      .from('encounters')
      .select('hunt_id')
      .eq('encounter_id', encounter_id)
      .eq('is_deleted', false)
      .single();

    if (fetchError || !encounter) {
      return NextResponse.json({ error: 'Encounter not found' }, { status: 404 });
    }

    // Check if the hunt belongs to the user
    const { data: hunt, error: huntError } = await supabase
      .from('hunts')
      .select('twitch_id')
      .eq('hunt_id', encounter.hunt_id)
      .single();

    if (huntError || !hunt || hunt.twitch_id !== parseInt(session.userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if island_number is already used by another active encounter (excluding the current one)
    const { data: existing, error: checkError } = await supabase
      .from('encounters')
      .select('encounter_id')
      .eq('hunt_id', encounter.hunt_id)
      .eq('island_number', parseInt(island_number))
      .eq('is_deleted', false)
      .neq('encounter_id', encounter_id)
      .maybeSingle();

    if (checkError) {
      return NextResponse.json({ error: 'Failed to validate island number' }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json({ error: 'Island number already in use' }, { status: 400 });
    }

    // Soft delete the old encounter and set island_number to null to avoid unique constraint conflicts
    const { error: deleteError } = await supabase
      .from('encounters')
      .update({
        is_deleted: true,
        deleted_id: session.login,
        island_number: null, // Set to null since it's now nullable
      })
      .eq('encounter_id', encounter_id);

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to update encounter' }, { status: 500 });
    }

    // Insert new encounter
    const { error: insertError } = await supabase
      .from('encounters')
      .insert({
        hunt_id: encounter.hunt_id,
        island_number: parseInt(island_number),
        villager_id: parseInt(villager_id),
        created_id: session.login,
      });

    if (insertError) {
      return NextResponse.json({ error: 'Failed to create new encounter' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}