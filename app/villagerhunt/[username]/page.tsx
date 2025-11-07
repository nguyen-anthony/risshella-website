import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { Alert, Box, Button, Container, Stack, Typography } from '@mui/material';
import OwnerHuntControls from '@/components/OwnerHuntControls';
import EncountersTable from '@/components/EncountersTable';
import { getSessionFromCookie } from '@/app/lib/session';
import { getModeratedChannels } from '@/app/lib/twitch';

type PageProps = {
  params: Promise<{ username: string }>;
  searchParams?: Promise<{ id?: string }>;
};

type Hunt = {
  hunt_id: number;
  hunt_name: string;
  target_villager_id: number | null;
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

  // Resolve twitch_id (use search param if provided; otherwise look up by username)
  let twitchId: number | null = null;
  const viaParam = sp?.id ? Number.parseInt(sp.id, 10) : NaN;
  if (!Number.isNaN(viaParam)) twitchId = viaParam;

  if (twitchId == null) {
    const { data: creatorRow } = await supabase
      .from('creators')
      .select('twitch_id')
      .ilike('twitch_username', username)
      .maybeSingle();
    twitchId = creatorRow?.twitch_id ?? null;
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
  console.log(`Access Token: ${session?.accessToken}`)
  if (!isOwner && session?.accessToken) {
    try {
      const mods = await getModeratedChannels(session.accessToken, session.userId);
      console.log(`Moderated channels count: ${mods.length}`)
      isModerator = mods.some((m) => m.broadcaster_id === String(twitchId));
    } catch {
      // ignore moderation check errors
    }
  }

  if (!hunt) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Typography variant="h4" fontWeight={700}>{username}</Typography>
          <Typography variant="h6" color="text.secondary">No active hunt</Typography>
        </Stack>
        {(isOwner || isModerator) && <OwnerHuntControls showStart />}
      </Container>
    );
  }

  // Fetch encounters for hunt (desc by island_number)
  const { data: encounters, error: encError } = await supabase
    .from('encounters')
    .select('island_number, encountered_at, villager_id')
    .eq('hunt_id', hunt.hunt_id)
    .order('island_number', { ascending: false });

  if (encError) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
        <Alert severity="error">Error loading encounters.</Alert>
      </Container>
    );
  }

  const encounterList = encounters ?? [];

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

  console.log(`Session: ${session?.login?.toLowerCase()}`)
  console.log(`isOwner: ${isOwner}`)

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
      <Stack spacing={0.5} sx={{ mb: 2 }}>
        <Typography variant="h4" component="h1" fontWeight={700}>{username}</Typography>
        <Typography variant="h6" component="h2" color="text.secondary">{hunt.hunt_name}</Typography>
        {targetVillagerName && (
          <Typography variant="body2" color="text.secondary">Target: {targetVillagerName}</Typography>
        )}
      </Stack>

      {(isOwner || isModerator) && (
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button variant="outlined" color="error">Abandon Hunt</Button>
          <Button variant="outlined" color="warning">Pause Hunt</Button>
          <Button variant="text">View Completed Hunts</Button>
          <Button variant="text">View Paused Hunts</Button>
          <Button variant="text">View Abandoned Hunts</Button>
        </Box>
      )}

      <EncountersTable encounters={encounterList} />
    </Container>
  );
}
