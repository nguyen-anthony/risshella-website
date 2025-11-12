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

  const formData = await request.formData();
  const huntId = formData.get('hunt_id') as string;
  const pauseActive = formData.get('pause_active') === 'true';

  if (!huntId) {
    return NextResponse.json({ error: 'Hunt ID required' }, { status: 400 });
  }

  // Get creator
  const { data: creator, error: creatorError } = await supabase
    .from('creators')
    .select('twitch_id')
    .ilike('twitch_username', session.login)
    .maybeSingle();

  if (creatorError || !creator) {
    return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
  }

  // Verify hunt belongs to creator and is PAUSED
  const { data: hunt, error: huntError } = await supabase
    .from('hunts')
    .select('twitch_id, hunt_status')
    .eq('hunt_id', huntId)
    .maybeSingle();

  if (huntError || !hunt || hunt.twitch_id !== creator.twitch_id || hunt.hunt_status !== 'PAUSED') {
    return NextResponse.json({ error: 'Hunt not found, access denied, or not paused' }, { status: 404 });
  }

  // If pause_active, pause the current active hunt
  if (pauseActive) {
    const { error: pauseError } = await supabase
      .from('hunts')
      .update({ hunt_status: 'PAUSED' })
      .eq('twitch_id', creator.twitch_id)
      .eq('hunt_status', 'ACTIVE');

    if (pauseError) {
      return NextResponse.json({ error: 'Failed to pause active hunt' }, { status: 500 });
    }
  }

  // Update hunt to ACTIVE
  const { error: updateError } = await supabase
    .from('hunts')
    .update({ hunt_status: 'ACTIVE' })
    .eq('hunt_id', huntId);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to resume hunt' }, { status: 500 });
  }

  // Redirect back to the hunt page
  return NextResponse.redirect(new URL(`/villagerhunt/${encodeURIComponent(session.login)}`, request.url));
}