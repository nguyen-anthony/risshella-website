'use client';

import * as React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HistoryIcon from '@mui/icons-material/History';
import EncountersTable from '@/components/villagerhunt/EncountersTable';
import HuntStatisticsModal from '@/components/villagerhunt/HuntStatisticsModal';
import ResumeButton from '@/components/villagerhunt/ResumeButton';

type Villager = {
  villager_id: number;
  name: string;
  image_url: string | null;
};

type Props = {
  hunt: {
    hunt_id: string;
    hunt_name: string;
    target_villager_id: number[];
    twitch_id: number;
    hunt_status: string;
  };
  displayName: string;
  villagers: Villager[];
  targetVillagers: Villager[];
  isOwner: boolean;
  isAuthenticated: boolean;
  username: string;
};

export default function HuntHistoryDetailClient({
  hunt,
  displayName,
  villagers,
  targetVillagers,
  isOwner,
  isAuthenticated,
  username,
}: Props) {
  const [huntStatsModalOpen, setHuntStatsModalOpen] = React.useState(false);

  const handleHuntStats = () => {
    setHuntStatsModalOpen(true);
  };

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h4" fontWeight={700}>{displayName}</Typography>
        <Typography variant="h6" color="text.secondary">{hunt.hunt_name}</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
          <Button component={Link} href={`/villagerhunt/${encodeURIComponent(username)}`} variant="outlined" startIcon={<ArrowBackIcon />}>
            Go back to current hunt
          </Button>
          <Button component={Link} href={`/villagerhunt/${encodeURIComponent(username)}/history`} variant="outlined" startIcon={<HistoryIcon />}>
            Go back to hunt history
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleHuntStats}
          >
            Hunt Statistics
          </Button>
        </Box>
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
      {isAuthenticated && isOwner && hunt.hunt_status === 'PAUSED' && (
        <ResumeButton huntId={hunt.hunt_id} huntName={hunt.hunt_name} twitchId={hunt.twitch_id} />
      )}
      <EncountersTable villagers={villagers} isOwner={false} isModerator={false} huntId={hunt.hunt_id} targetVillagerIds={hunt.target_villager_id} />

      <HuntStatisticsModal
        open={huntStatsModalOpen}
        onClose={() => setHuntStatsModalOpen(false)}
        huntId={hunt.hunt_id}
      />
    </Stack>
  );
}