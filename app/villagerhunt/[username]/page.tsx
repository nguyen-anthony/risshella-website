import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { Alert, Box, Button, Container, Stack, Typography } from '@mui/material';
import OwnerHuntControls from '@/components/OwnerHuntControls';
import EncountersTable from '@/components/EncountersTable';
import { getSessionFromCookie } from '@/app/lib/session';
import { getModeratedChannels } from '../../lib/twitch';
import AuthLink from '@/components/AuthLink';

type PageProps = {
  params: Promise<{ username: string }>;
  searchParams?: Promise<{ id?: string }>;
};

type Hunt = {
  hunt_id: string;
  hunt_name: string;
  target_villager_id: number | null;
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

  // Fetch ACTIVE hunt for creator
  const { data: hunt, error: huntError } = await supabase
    .from('hunts')
    .select('hunt_id, hunt_name, target_villager_id')
    .eq('twitch_id', twitchId)
    .eq('hunt_status', 'ACTIVE')
    .order('hunt_id', { ascending: false })
    .maybeSingle<Hunt>();

  if (huntError) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
        <Alert severity="error">Error loading active hunt.</Alert>
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

  if (!hunt) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Typography variant="h4" fontWeight={700}>{displayName}</Typography>
          <Typography variant="h6" color="text.secondary">No active hunt</Typography>
        </Stack>
        {isOwner && <OwnerHuntControls showStart />}
      </Container>
    );
  }

  // Fetch encounters for hunt (desc by island_number) - moved to component
  // const { data: encounters, error: encError } = await supabase
  //   .from('encounters')
  //   .select('encounter_id, island_number, encountered_at, villager_id')
  //   .eq('hunt_id', hunt.hunt_id)
  //   .eq('is_deleted', false)
  //   .order('island_number', { ascending: false });

  // if (encError) {
  //   return (
  //     <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
  //       <Alert severity="error">Error loading encounters.</Alert>
  //     </Container>
  //   );
  // }

  // const encounterList = encounters ?? [];

  // Fetch villagers for encounter lookup
  const { data: villagers } = await supabase
    .from('villagers')
    .select('villager_id, name, image_url');

  // Resolve target villager name for header (single row)
  let targetVillagerName: string | null = null;
  if (hunt.target_villager_id != null) {
    const { data: targetRow } = await supabase
      .from('villagers')
      .select('name')
      .eq('villager_id', hunt.target_villager_id)
      .maybeSingle();
    targetVillagerName = targetRow?.name ?? null;
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
      <Stack spacing={0.5} sx={{ mb: 2 }}>
        <Typography variant="h4" component="h1" fontWeight={700}>{displayName}</Typography>
        {!session && <AuthLink username={displayName} />}
        <Typography variant="h6" component="h2" color="text.secondary">{hunt.hunt_name}</Typography>
        {targetVillagerName && (
          <Typography variant="body2" color="text.secondary">Target: {targetVillagerName}</Typography>
        )}
      </Stack>

      {isOwner && (
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <form action="/api/hunts/abandon" method="post" style={{ display: 'inline' }}>
            <input type="hidden" name="hunt_id" value={hunt.hunt_id} />
            <Button type="submit" variant="outlined" color="error">Abandon Hunt</Button>
          </form>
          <form action="/api/hunts/pause" method="post" style={{ display: 'inline' }}>
            <input type="hidden" name="hunt_id" value={hunt.hunt_id} />
            <Button type="submit" variant="outlined" color="warning">Pause Hunt</Button>
          </form>
        </Box>
      )}

      <EncountersTable villagers={villagers || []} isOwner={isOwner} isModerator={isModerator} huntId={hunt.hunt_id} />
    </Container>
  );
}
