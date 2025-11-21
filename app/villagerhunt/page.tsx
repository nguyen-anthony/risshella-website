import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import type { Creator } from '@/types/creator';
import { getSessionFromCookie } from '@/app/lib/session';
import VillagerHuntClient from '@/components/villagerhunt/VillagerHuntClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "ACNH Villager Hunt",
};

type PageData = {
  creators: Creator[];
  session: ReturnType<typeof getSessionFromCookie> extends Promise<infer T> ? T : never;
  error?: Error | null;
  activeHunts: { hunt_id: string; hunt_name: string; twitch_id: number }[];
};

export default async function VillagerHunt() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const session = await getSessionFromCookie();

  // Get all public creators
  const { data: publicCreators, error: publicError } = await supabase
    .from('creators')
    .select('twitch_id, twitch_username, display_name, avatar_url, is_public')
    .eq('is_public', true)
    .order('created_at', { ascending: true });

  let creators = (publicCreators ?? []) as Creator[];
  let error = publicError;

  // If user is authenticated, also fetch their creator record (even if private)
  if (session) {
    const { data: userCreator, error: userError } = await supabase
      .from('creators')
      .select('twitch_id, twitch_username, display_name, avatar_url, is_public')
      .eq('twitch_username', session.login)
      .single();

    if (userCreator && !error) {
      // Add user creator to the list if not already included (in case they are public)
      const userExists = creators.some(c => c.twitch_id === userCreator.twitch_id);
      if (!userExists) {
        creators = [userCreator, ...creators];
      }
    }

    // Use user error if public query succeeded but user query failed
    if (!error && userError && userError.code !== 'PGRST116') { // PGRST116 is "not found"
      error = userError;
    }
  }

  // Get active hunts
  const { data: activeHunts } = await supabase
    .from('hunts')
    .select('hunt_id, hunt_name, twitch_id')
    .eq('hunt_status', 'ACTIVE');

  const pageData: PageData = {
    creators,
    session,
    error,
    activeHunts: activeHunts || [],
  };

  return <VillagerHuntClient data={pageData} />;
}