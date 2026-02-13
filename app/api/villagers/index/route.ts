import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from('villagers')
    .select('villager_id, name, image_url, amiibo_only, species, personality, sign')
    .order('name');

  if (error) {
    return NextResponse.json({ villagers: [] }, { status: 200, headers: { 'Cache-Control': 'public, max-age=300' } });
  }

  // Exclude amiibo-only villagers (cannot appear on mystery islands)
  const filteredVillagers = (data ?? []).filter(villager => 
    villager.amiibo_only !== true
  );

  return NextResponse.json(
    { villagers: filteredVillagers },
    {
      headers: {
        // Cache for 1 hour client-side, 1 day on CDN, serve stale while revalidating
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    }
  );
}
