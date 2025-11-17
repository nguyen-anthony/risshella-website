import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { Alert, Container } from '@mui/material';
import { getSessionFromCookie } from '@/app/lib/session';
import HuntHistoryDetailClient from '@/components/villagerhunt/HuntHistoryDetailClient';

type PageProps = {
  params: Promise<{ username: string; hunt_id: string }>;
};

export default async function HuntDetailPage(props: PageProps) {
  const { params } = props;
  const { username: rawUsername, hunt_id } = await params;
  const username = decodeURIComponent(rawUsername);
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const session = await getSessionFromCookie();
  const isOwner = session && session.login.toLowerCase() === username.toLowerCase();

  // Fetch hunt by hunt_id
  const { data: hunt, error: huntError } = await supabase
    .from('hunts')
    .select('hunt_id, hunt_name, target_villager_id, twitch_id, hunt_status')
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
      <HuntHistoryDetailClient
        hunt={hunt}
        displayName={displayName}
        villagers={villagers}
        targetVillagers={targetVillagers}
        isOwner={isOwner || false}
      />
    </Container>
  );
}