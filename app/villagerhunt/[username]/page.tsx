import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { Alert, Container } from '@mui/material';
import { getSessionFromCookie } from '@/app/lib/session';
import { getModeratedChannels } from '../../lib/twitch';
import HuntPageWrapper from '@/components/HuntPageWrapper';

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
    try {
      const mods = await getModeratedChannels(session.accessToken, session.userId);
      console.log(`Moderated channels count: ${mods.length}`)
      isModerator = mods.some((m: ModeratedChannel) => m.broadcaster_id === String(twitchId));
    } catch {
      // ignore moderation check errors
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
