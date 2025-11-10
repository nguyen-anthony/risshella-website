import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const body = await request.json();
    const { hunt_id, island_number, villager_id } = body;

    if (!hunt_id || !island_number || !villager_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert encounter
    const { error } = await supabase
      .from('encounters')
      .insert({
        hunt_id,
        island_number: parseInt(island_number),
        villager_id: parseInt(villager_id),
      });

    if (error) {
      return NextResponse.json({ error: 'Failed to add encounter' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}