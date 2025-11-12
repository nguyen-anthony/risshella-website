import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { Alert, Container, Typography, Box, Stack, Card, CardContent } from '@mui/material';
import Link from 'next/link';

type PageProps = {
  params: Promise<{ username: string }>;
};

type Villager = {
  villager_id: number;
  name: string;
  image_url: string | null;
};

export default async function HuntHistoryPage(props: PageProps) {
  const { params } = props;
  const { username: rawUsername } = await params;
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
          <Link href={`/villagerhunt/${encodeURIComponent(username)}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
            Back to Current Hunt
          </Link>
        </Box>
        {hunts && hunts.length > 0 ? (
          hunts.map((hunt) => {
            const dreamies = hunt.target_villager_id.map((id: number) => villagersMap[id]).filter(Boolean);
            return (
              <Link key={hunt.hunt_id} href={`/villagerhunt/${encodeURIComponent(username)}/history/${hunt.hunt_id}`} style={{ textDecoration: 'none' }}>
                <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">{hunt.hunt_name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Status: {hunt.hunt_status} { hunt.complete_ts ? `| Completed: ${new Date(hunt.complete_ts).toLocaleDateString()}` : ''}
                        </Typography>
                        {dreamies.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">Dreamies:</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                              {dreamies.map((villager: Villager) => (
                                <Box key={villager.villager_id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box
                                    component="img"
                                    src={villager.image_url || undefined}
                                    alt={villager.name}
                                    sx={{ maxWidth: 40, maxHeight: 40, borderRadius: 1 }}
                                  />
                                  <Typography variant="body2">{villager.name}</Typography>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        ) : (
          <Typography>No previous hunts found.</Typography>
        )}
      </Stack>
    </Container>
  );
}