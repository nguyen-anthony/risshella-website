import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { Alert, Container, Typography, Box, Stack } from '@mui/material';
import Link from 'next/link';
import EncountersTable from '@/components/EncountersTable';

type PageProps = {
  params: Promise<{ username: string; hunt_id: string }>;
};

export default async function HuntDetailPage(props: PageProps) {
  const { params } = props;
  const { username: rawUsername, hunt_id } = await params;
  const username = decodeURIComponent(rawUsername);
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch hunt by hunt_id
  const { data: hunt, error: huntError } = await supabase
    .from('hunts')
    .select('hunt_id, hunt_name, target_villager_id, twitch_id')
    .eq('hunt_id', hunt_id)
    .maybeSingle();

  if (huntError || !hunt) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
        <Alert severity="error">Hunt not found.</Alert>
      </Container>
    );
  }

  // Fetch creator display name
  const { data: creatorRow } = await supabase
    .from('creators')
    .select('display_name')
    .eq('twitch_id', hunt.twitch_id)
    .maybeSingle();
  const displayName = creatorRow?.display_name ?? username;

  // Fetch villagers for encounter lookup
  const { data: villagersData } = await supabase
    .from('villagers')
    .select('villager_id, name, image_url');

  // Exclude villagers that require additional purchases (not part of base game)
  const excludedVillagerIds = [627, 573, 571, 731, 811, 876];
  const villagers = (villagersData || []).filter(villager => !excludedVillagerIds.includes(villager.villager_id));

  // Resolve target villagers data
  const targetVillagers = villagers.filter(v => hunt.target_villager_id.includes(v.villager_id));

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={700}>{displayName}</Typography>
          <Typography variant="h6" color="text.secondary">{hunt.hunt_name}</Typography>
          <Link href={`/villagerhunt/${encodeURIComponent(username)}/history`} style={{ color: 'inherit', textDecoration: 'underline' }}>
            Back to Hunt History
          </Link>
        </Box>
        {targetVillagers.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">Dreamie List:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {targetVillagers.map((villager) => (
                <Box key={villager.villager_id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    component="img"
                    src={villager.image_url || undefined}
                    alt={villager.name}
                    sx={{ maxWidth: 60, maxHeight: 60, borderRadius: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">{villager.name}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
        <EncountersTable villagers={villagers} isOwner={false} isModerator={false} huntId={hunt.hunt_id} targetVillagerIds={hunt.target_villager_id} />
      </Stack>
    </Container>
  );
}