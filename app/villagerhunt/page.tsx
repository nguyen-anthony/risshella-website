import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import type { Creator } from '@/types/creator';
import { refreshVillagersIfStale } from '@/app/lib/villagers';
import { getSessionFromCookie } from '@/app/lib/session';
import VillagerHuntClient from '@/components/VillagerHuntClient';

type PageData = {
  creators: Creator[];
  session: ReturnType<typeof getSessionFromCookie> extends Promise<infer T> ? T : never;
  error?: Error | null;
};

export default async function VillagerHunt() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const session = await getSessionFromCookie();

  // Opportunistic refresh of villagers table when stale (>24h). Silently ignores if API key missing.
  await refreshVillagersIfStale(supabase);

  const { data, error } = await supabase
    .from('creators')
    .select('twitch_id, twitch_username, display_name, avatar_url');

  const creators = (data ?? []) as Creator[];

  const pageData: PageData = {
    creators,
    session,
    error,
  };

  return <VillagerHuntClient data={pageData} />;
}