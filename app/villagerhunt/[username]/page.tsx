import { cookies } from 'next/headers';
import { createClient, createServiceClient } from '@/utils/supabase/server';
import { Alert, Container } from '@mui/material';
import { getSessionFromCookie, setSessionCookie } from '@/app/lib/session';
import { getModeratedChannels, refreshAccessToken } from '@/app/lib/twitch';
import HuntPageWrapper from '@/components/villagerhunt/HuntPageWrapper';
import type { Metadata } from 'next';

type PageProps = {
  params: Promise<{ username: string }>;
  searchParams?: Promise<{ id?: string }>;
};

type ModeratedChannel = {
  broadcaster_id: string;
  broadcaster_login: string;
  broadcaster_name: string;
};

// Encounters are passed to a client component; keeping type local there.

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { params, searchParams } = props;
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername);
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const sp = searchParams ? await searchParams : undefined;
  const viaParam = sp?.id ? Number.parseInt(sp.id, 10) : NaN;
  let displayName = username;

  if (!Number.isNaN(viaParam)) {
    const { data: creatorRow } = await supabase
      .from('creators')
      .select('display_name')
      .eq('twitch_id', viaParam)
      .maybeSingle();
    displayName = creatorRow?.display_name ?? username;
  } else {
    const { data: creatorRow } = await supabase
      .from('creators')
      .select('display_name')
      .ilike('twitch_username', username)
      .maybeSingle();
    displayName = creatorRow?.display_name ?? username;
  }

  return {
    title: `${displayName} - Villager Hunt`,
  };
}

export default async function CreatorHuntPage(props: PageProps) {
  const { params, searchParams } = props;
  const { username: rawUsername } = await params;
  const sp = searchParams ? await searchParams : undefined;
  const username = decodeURIComponent(rawUsername);
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const session = await getSessionFromCookie();
  const isOwner = !!session && session.login?.toLowerCase() === username.toLowerCase();
  let isModerator = false;
  let displayName = username; // Default to username, will be updated if creator found

  // Resolve twitch_id (use search param if provided; otherwise look up by username)
  let twitchId: number | null = null;
  const viaParam = sp?.id ? Number.parseInt(sp.id, 10) : NaN;
  if (!Number.isNaN(viaParam)) twitchId = viaParam;

  if (twitchId == null) {
    const { data: creatorRow } = await supabase
      .from('creators')
      .select('twitch_id, display_name')
      .ilike('twitch_username', username)
      .maybeSingle();
    twitchId = creatorRow?.twitch_id ?? null;
    displayName = creatorRow?.display_name ?? username;
  }

  if (twitchId == null) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
        <Alert severity="error">Creator not found.</Alert>
      </Container>
    );
  }

  // If not owner, check if user moderates this channel
  if (!isOwner && session?.accessToken) {
    // Refresh token if expired
    if (session.exp < Date.now() / 1000 && session.refreshToken) {
      try {
        const newToken = await refreshAccessToken(session.refreshToken);
        session.accessToken = newToken.access_token;
        session.refreshToken = newToken.refresh_token;
        session.exp = Math.floor(Date.now() / 1000) + newToken.expires_in;
        await setSessionCookie(session);
      } catch (error) {
        console.error('Failed to refresh token:', error);
        // If refresh fails, clear session or ignore
      }
    }

    try {
      const mods = await getModeratedChannels(session.accessToken, session.userId);
      console.log(`Moderated channels count: ${mods.length}`)
      isModerator = mods.some((m: ModeratedChannel) => m.broadcaster_id === String(twitchId));
    } catch {
      // ignore moderation check errors
    }
  }

  // Check if user is a temporary moderator
  if (!isOwner && session?.userId) {
    const serviceSupabase = createServiceClient(cookieStore);
    const { data: tempModData } = await serviceSupabase
      .from('temp_mods')
      .select('temp_mod_twitch_id')
      .eq('creator_twitch_id', twitchId)
      .eq('temp_mod_twitch_id', parseInt(session.userId))
      .gt('expiry_timestamp', new Date().toISOString())
      .maybeSingle();
    if (tempModData) {
      isModerator = true;
    }
  }

  return (
    <HuntPageWrapper
      initialDisplayName={displayName}
      initialTwitchId={twitchId}
      initialSession={session}
      initialIsOwner={isOwner}
      initialIsModerator={isModerator}
      initialUsername={username}
    />
  );
}
