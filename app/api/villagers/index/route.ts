import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from('villagers')
    .select('villager_id, name, image_url');

  if (error) {
    return NextResponse.json({ villagers: [] }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  }

  return NextResponse.json(
    { villagers: data ?? [] },
    {
      headers: {
        // Cache for a day at the edge; clients may still use localStorage for longer
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    }
  );
}
