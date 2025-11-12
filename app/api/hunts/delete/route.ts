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

  // Verify hunt belongs to creator
  const { data: hunt, error: huntError } = await supabase
    .from('hunts')
    .select('twitch_id')
    .eq('hunt_id', huntId)
    .maybeSingle();

  if (huntError || !hunt || hunt.twitch_id !== creator.twitch_id) {
    return NextResponse.json({ error: 'Hunt not found or access denied' }, { status: 404 });
  }

  // Delete the hunt
  const { error: deleteError } = await supabase
    .from('hunts')
    .delete()
    .eq('hunt_id', huntId);

  if (deleteError) {
    console.error('Failed to delete hunt:', deleteError);
    return NextResponse.json({ error: 'Failed to delete hunt' }, { status: 500 });
  }

  // Redirect back to the hunt page
  return NextResponse.redirect(new URL(`/villagerhunt/${encodeURIComponent(session.login)}`, request.url));
}