import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import type { Creator } from '@/types/creator';
import { getSessionFromCookie, setSessionCookie } from '@/app/lib/session';
import { refreshAccessToken, getStreams } from '@/app/lib/twitch';
import VillagerHuntClient from '@/components/villagerhunt/VillagerHuntClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "ACNH Villager Hunt",
};

type ActiveHunt = { hunt_id: string; hunt_name: string; twitch_id: number; current_island: number };

type PageData = {
  creators: Creator[];
  session: ReturnType<typeof getSessionFromCookie> extends Promise<infer T> ? T : never;
  error?: Error | null;
  activeHunts: ActiveHunt[];
  liveStreamUserIds: string[];
};

export default async function VillagerHunt() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const session = await getSessionFromCookie();

  // Refresh token if expired
  if (session && session.exp < Date.now() / 1000 && session.refreshToken) {
    try {
      const newToken = await refreshAccessToken(session.refreshToken);
      session.accessToken = newToken.access_token;
      session.refreshToken = newToken.refresh_token;
      session.exp = Math.floor(Date.now() / 1000) + newToken.expires_in;
      await setSessionCookie(session);
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // If refresh fails, proceed with expired session or clear it
    }
  }

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

  // Get active hunts with current island
  const { data: activeHunts } = await supabase.rpc('get_active_hunts_with_island');

  // Get set of twitch IDs with active hunts
  const activeHuntTwitchIds = new Set((activeHunts ?? []).map((hunt: ActiveHunt) => hunt.twitch_id));
  const creatorsWithActiveHunts = creators.filter(creator => activeHuntTwitchIds.has(creator.twitch_id));

  // Check which creators are live streaming Animal Crossing: New Horizons
  const ACNH_GAME_ID = '509538';
  let liveStreamUserIds: string[] = [];
  
  if (creatorsWithActiveHunts.length > 0) {
    try {
      const userIds = creatorsWithActiveHunts.map(c => c.twitch_id.toString());
      const liveStreams = await getStreams(userIds, ACNH_GAME_ID);
      console.log(liveStreams)
      liveStreamUserIds = liveStreams.map(stream => stream.user_id);
    } catch (error) {
      console.error('Failed to fetch live streams:', error);
      // Continue without live stream data
    }
  }

  // Sort creators by priority: live + active hunt > active hunt > no active hunt
  const liveStreamUserIdSet = new Set(liveStreamUserIds);
  const sortedCreators = [...creators].sort((a, b) => {
    const aIsLive = liveStreamUserIdSet.has(a.twitch_id.toString());
    const bIsLive = liveStreamUserIdSet.has(b.twitch_id.toString());
    const aHasActiveHunt = activeHuntTwitchIds.has(a.twitch_id);
    const bHasActiveHunt = activeHuntTwitchIds.has(b.twitch_id);
    
    // Calculate priority: 3 = live + active hunt, 2 = active hunt, 1 = no active hunt
    const aPriority = aIsLive && aHasActiveHunt ? 3 : aHasActiveHunt ? 2 : 1;
    const bPriority = bIsLive && bHasActiveHunt ? 3 : bHasActiveHunt ? 2 : 1;
    
    // Higher priority comes first
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    // Same priority: maintain original order (already sorted by created_at from the query)
    return 0;
  });

  const pageData: PageData = {
    creators: sortedCreators,
    session,
    error,
    activeHunts,
    liveStreamUserIds,
  };

  return <VillagerHuntClient data={pageData} />;
}