'use client';

import * as React from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import OwnerHuntControls from '@/components/OwnerHuntControls';
import EncountersTable from '@/components/EncountersTable';
import AuthLink from '@/components/AuthLink';
import { generateBingoCard } from '@/utils/bingoCardGenerator';
import UpdateIslandVillagersModal from '@/components/UpdateIslandVillagersModal';
import BingoCardModal from '@/components/BingoCardModal';
import { createClient } from '@/utils/supabase/client';

type Hunt = {
  hunt_id: string;
  hunt_name: string;
  target_villager_id: number[];
  island_villagers: number[];
};

type Villager = {
  villager_id: number;
  name: string;
  image_url: string | null;
};

type Session = {
  login: string;
  userId: string;
  accessToken?: string;
};

type Props = {
  initialDisplayName: string;
  initialTwitchId: number;
  initialSession: Session | null;
  initialIsOwner: boolean;
  initialIsModerator: boolean;
};

export default function HuntPageWrapper({
  initialDisplayName,
  initialTwitchId,
  initialSession,
  initialIsOwner,
  initialIsModerator,
}: Props) {
  const [hunt, setHunt] = React.useState<Hunt | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [villagers, setVillagers] = React.useState<Villager[]>([]);
  const [generatingBingo, setGeneratingBingo] = React.useState(false);
  const [updateIslandModalOpen, setUpdateIslandModalOpen] = React.useState(false);
  const [bingoCardModalOpen, setBingoCardModalOpen] = React.useState(false);
  const [bingoCardImage, setBingoCardImage] = React.useState<string | null>(null);

  // Fetch hunt data
  const fetchHuntData = React.useCallback(async () => {
    const supabase = createClient();

    // Fetch ACTIVE hunt
    const { data: huntData, error: huntError } = await supabase
      .from('hunts')
      .select('hunt_id, hunt_name, target_villager_id, island_villagers')
      .eq('twitch_id', initialTwitchId)
      .eq('hunt_status', 'ACTIVE')
      .order('hunt_id', { ascending: false })
      .maybeSingle();

    if (!huntError) {
      setHunt(huntData);
    }

    // Fetch villagers for encounter lookup
    const { data: villagersData } = await supabase
      .from('villagers')
      .select('villager_id, name, image_url');

    setVillagers(villagersData || []);
    setLoading(false);
  }, [initialTwitchId]);

  // Initial fetch
  React.useEffect(() => {
    fetchHuntData();
  }, [fetchHuntData]);

  // Handle bingo card generation
  const handleGenerateBingoCard = async () => {
    if (!hunt) return;

    setGeneratingBingo(true);
    setBingoCardImage(null); // Clear previous image
    setBingoCardModalOpen(true);

    try {
      const imageDataUrl = await generateBingoCard({
        huntId: hunt.hunt_id,
        huntName: hunt.hunt_name,
        creatorName: initialDisplayName,
        targetVillagers: targetVillagers,
        islandVillagers: hunt.island_villagers,
        villagers,
      });

      setBingoCardImage(imageDataUrl);
    } catch (error) {
      console.error('Failed to generate bingo card:', error);
      setBingoCardImage(null);
    } finally {
      setGeneratingBingo(false);
    }
  };

  // Resolve target villagers data
  const [targetVillagers, setTargetVillagers] = React.useState<Villager[]>([]);

  React.useEffect(() => {
    if (!hunt?.target_villager_id || hunt.target_villager_id.length === 0) {
      setTargetVillagers([]);
      return;
    }
    const targetVillagersData = villagers.filter(v => hunt.target_villager_id.includes(v.villager_id));
    setTargetVillagers(targetVillagersData);
  }, [hunt?.target_villager_id, villagers]);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!hunt) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Typography variant="h4" fontWeight={700}>{initialDisplayName}</Typography>
          <Typography variant="h6" color="text.secondary">No active hunt</Typography>
        </Stack>
        {initialIsOwner && <OwnerHuntControls showStart onHuntCreated={fetchHuntData} />}
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
      <Stack spacing={0.5} sx={{ mb: 2 }}>
        <Typography variant="h4" component="h1" fontWeight={700}>{initialDisplayName}</Typography>
        {!initialSession && <AuthLink username={initialDisplayName} />}
        <Typography variant="h6" component="h2" color="text.secondary">{hunt.hunt_name}</Typography>
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
      </Stack>

      {initialIsOwner && (
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateBingoCard}
            disabled={generatingBingo}
          >
            {generatingBingo ? 'Generating...' : 'Generate Bingo Card'}
          </Button>
          <Button
            variant="outlined"
            onClick={() => setUpdateIslandModalOpen(true)}
          >
            Update Island Villagers
          </Button>
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

      <EncountersTable villagers={villagers} isOwner={initialIsOwner} isModerator={initialIsModerator} huntId={hunt.hunt_id} />

      <UpdateIslandVillagersModal
        open={updateIslandModalOpen}
        onClose={() => setUpdateIslandModalOpen(false)}
        huntId={hunt.hunt_id}
        currentIslandVillagers={hunt.island_villagers}
        villagers={villagers}
        onUpdated={fetchHuntData}
      />

      <BingoCardModal
        open={bingoCardModalOpen}
        onClose={() => setBingoCardModalOpen(false)}
        onRegenerate={handleGenerateBingoCard}
        bingoCardImage={bingoCardImage}
        loading={generatingBingo}
      />

    </Container>
  );
}