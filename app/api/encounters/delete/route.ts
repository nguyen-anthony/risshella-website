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
    const { encounter_id } = body;

    if (!encounter_id) {
      return NextResponse.json({ error: 'Missing encounter_id' }, { status: 400 });
    }

    // First, get the encounter to check ownership
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

    // Soft delete encounter
    const { error } = await supabase
      .from('encounters')
      .update({
        is_deleted: true,
        deleted_id: session.login,
      })
      .eq('encounter_id', encounter_id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete encounter' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}