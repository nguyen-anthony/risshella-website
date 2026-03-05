'use client';

import * as React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HistoryIcon from '@mui/icons-material/History';
import EncountersTable from '@/components/villagerhunt/tables/EncountersTable';
import HuntStatisticsModal from '@/components/villagerhunt/modals/HuntStatisticsModal';
import ResumeButton from '@/components/villagerhunt/controls/ResumeButton';
import ExportHuntButton from '@/components/villagerhunt/controls/ExportHuntButton';
import VillagerDisplay from '@/components/villagerhunt/displays/VillagerDisplay';
import type { Villager } from '@/types/villagerhunt';

type Props = {
  hunt: {
    hunt_id: string;
    hunt_name: string;
    target_villager_id: number[];
    island_villagers?: number[];
    twitch_id: number;
    hunt_status: string;
  };
  displayName: string;
  villagers: Villager[];
  targetVillagers: Villager[];
  isOwner: boolean;
  isAuthenticated: boolean;
  username: string;
  islandVillagerIds?: number[];
};

export default function HuntHistoryDetailClient({
  hunt,
  displayName,
  villagers,
  targetVillagers,
  isOwner,
  isAuthenticated,
  username,
  islandVillagerIds = [],
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
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleHuntStats}
          >
            Hunt Statistics
          </Button>
          {isOwner && (
            <ExportHuntButton
              huntId={hunt.hunt_id}
              huntName={hunt.hunt_name}
              targetVillagerIds={hunt.target_villager_id}
              islandVillagerIds={islandVillagerIds}
              villagers={villagers}
            />
          )}
        </Box>
      </Box>
      {targetVillagers.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">Dreamie List:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {targetVillagers.map((villager) => (
              <VillagerDisplay key={villager.villager_id} villager={villager} variant="image" />
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