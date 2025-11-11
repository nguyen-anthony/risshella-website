import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from('villagers')
    .select('villager_id, name, image_url');

  if (error) {
    return NextResponse.json({ villagers: [] }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  }

  // Exclude villagers that require additional purchases (not part of base game)
  const excludedVillagerIds = [627, 573, 571, 731, 811, 876];
  const filteredVillagers = (data ?? []).filter(villager => !excludedVillagerIds.includes(villager.villager_id));

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
