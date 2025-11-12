import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { Alert, Container, Typography, Box, Stack } from '@mui/material';
import Link from 'next/link';
import HuntStatusFilter from '@/components/HuntStatusFilter';
import HuntCard from '@/components/HuntCard';

type PageProps = {
  params: Promise<{ username: string }>;
  searchParams?: Promise<{ status?: string }>;
};

type Villager = {
  villager_id: number;
  name: string;
  image_url: string | null;
};

export default async function HuntHistoryPage(props: PageProps) {
  const { params, searchParams } = props;
  const { username: rawUsername } = await params;
  const sp = searchParams ? await searchParams : {};
  const statusFilter = sp.status;
  const username = decodeURIComponent(rawUsername);
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Query creators table for twitch_id
  const { data: creatorRow } = await supabase
    .from('creators')
    .select('twitch_id, display_name')
    .ilike('twitch_username', username)
    .maybeSingle();
  const twitchId = creatorRow?.twitch_id ?? null;

  if (!twitchId) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
        <Alert severity="error">Creator not found.</Alert>
      </Container>
    );
  }

  const displayName = creatorRow?.display_name ?? username;

  // Fetch non-active hunts
  const { data: hunts, error } = await supabase
    .from('hunts')
    .select('hunt_id, hunt_name, target_villager_id, hunt_status, start_ts, complete_ts')
    .eq('twitch_id', twitchId)
    .neq('hunt_status', 'ACTIVE')
    .order('start_ts', { ascending: false });

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
        <Alert severity="error">Failed to load hunt history.</Alert>
      </Container>
    );
  }

  // Filter hunts by status if specified
  const filteredHunts = statusFilter ? hunts?.filter(hunt => hunt.hunt_status === statusFilter) : hunts;

  // Fetch villagers for dreamie lookup
  const { data: villagersData } = await supabase
    .from('villagers')
    .select('villager_id, name, image_url');

  const villagersMap: Record<number, Villager> = {};
  (villagersData || []).forEach(v => {
    villagersMap[v.villager_id] = v;
  });

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={700}>{displayName} - Hunt History</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
            <HuntStatusFilter />
            <Link href={`/villagerhunt/${encodeURIComponent(username)}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
              Back to Current Hunt
            </Link>
          </Box>
        </Box>
        {filteredHunts && filteredHunts.length > 0 ? (
          filteredHunts.map((hunt) => (
            <HuntCard key={hunt.hunt_id} hunt={hunt} username={username} twitchId={twitchId} villagersMap={villagersMap} />
          ))
        ) : (
          <Typography>No previous hunts found.</Typography>
        )}
      </Stack>
    </Container>
  );
}