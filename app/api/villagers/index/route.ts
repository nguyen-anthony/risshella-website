import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from('villagers')
    .select('villager_id, name, image_url, amiibo_only')
    .order('name');

  if (error) {
    return NextResponse.json({ villagers: [] }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  }

  // Exclude amiibo-only villagers (cannot appear on mystery islands)
  const filteredVillagers = (data ?? []).filter(villager => 
    villager.amiibo_only !== true
  );

  return NextResponse.json(
    { villagers: filteredVillagers },
    {
      headers: {
        // Avoid serving stale lists in the modal; let clients cache in-memory if desired
        'Cache-Control': 'no-store',
      },
    }
  );
}
