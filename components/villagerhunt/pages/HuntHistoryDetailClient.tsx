'use client';

import * as React from 'react';
import { Box, Button, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HistoryIcon from '@mui/icons-material/History';
import CasinoIcon from '@mui/icons-material/Casino';
import EncountersTable from '@/components/villagerhunt/tables/EncountersTable';
import HuntStatisticsModal from '@/components/villagerhunt/modals/HuntStatisticsModal';
import ResumeButton from '@/components/villagerhunt/controls/ResumeButton';
import ExportHuntButton from '@/components/villagerhunt/controls/ExportHuntButton';
import VillagerDisplay from '@/components/villagerhunt/displays/VillagerDisplay';
import BingoCardDrawer from '@/components/villagerhunt/drawers/BingoCardDrawer';
import { useVillagers, useBingoCard } from '@/components/villagerhunt/hooks';
import { selectBingoVillagers, type BingoFilters } from '@/utils/bingoCardGenerator';
import type { Villager } from '@/types/villagerhunt';

type Props = {
  hunt: {
    hunt_id: string;
    hunt_name: string;
    target_villager_id: number[];
    island_villagers?: number[];
    hotel_tourists?: number[];
    twitch_id: number;
    hunt_status: string;
    bingo_card_size?: number;
    bingo_filter_species?: string[];
    bingo_filter_personalities?: string[];
    bingo_remove_free_space?: boolean;
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
  const { villagers: allVillagers } = useVillagers({ includeAmiiboOnly: true });
  const bingoCard = useBingoCard(hunt.hunt_id);
  const [huntStatsModalOpen, setHuntStatsModalOpen] = React.useState(false);
  const [bingoCardDrawerOpen, setBingoCardDrawerOpen] = React.useState(false);
  const [generatingBingo, setGeneratingBingo] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const bingoCardSize = hunt.bingo_card_size ?? 5;
  const hotelTourists = hunt.hotel_tourists ?? [];

  const handleHuntStats = () => {
    setHuntStatsModalOpen(true);
  };

  const handleGenerateBingoCard = async (filters?: BingoFilters, removeFreeSpace?: boolean) => {
    setGeneratingBingo(true);
    try {
      const villagerIds = selectBingoVillagers({
        targetVillagers,
        islandVillagers: islandVillagerIds,
        hotelTourists,
        villagers,
        bingoCardSize,
        filters,
        removeFreeSpace,
      });
      bingoCard.generateCard(villagerIds, bingoCardSize, removeFreeSpace ?? false);
    } catch (error) {
      console.error('Failed to generate bingo card:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate bingo card');
    } finally {
      setGeneratingBingo(false);
    }
  };

  const handleGenerateCustomBingoCard = (villagerIds: number[], removeFreeSpace = false) => {
    bingoCard.generateCard(villagerIds, bingoCardSize, removeFreeSpace);
  };

  const ownerFilters: BingoFilters | undefined =
    (hunt.bingo_filter_species?.length ?? 0) > 0 || (hunt.bingo_filter_personalities?.length ?? 0) > 0
      ? { species: hunt.bingo_filter_species ?? [], personalities: hunt.bingo_filter_personalities ?? [] }
      : undefined;

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
          <Button
            variant="outlined"
            color="primary"
            startIcon={<CasinoIcon />}
            onClick={() => isMobile ? null : setBingoCardDrawerOpen(!bingoCardDrawerOpen)}
            component={isMobile ? Link : 'button'}
            href={isMobile ? `/villagerhunt/${encodeURIComponent(username)}/bingocard/${hunt.hunt_id}` : undefined}
          >
            Bingo Card
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

      <BingoCardDrawer
        open={bingoCardDrawerOpen}
        onClose={() => setBingoCardDrawerOpen(false)}
        onGenerate={handleGenerateBingoCard}
        onGenerateCustom={handleGenerateCustomBingoCard}
        onClear={bingoCard.clearCard}
        cardData={bingoCard.cardData}
        villagers={allVillagers}
        onSquareClick={bingoCard.toggleSquare}
        loading={generatingBingo}
        targetVillagers={targetVillagers.map(v => ({ villager_id: v.villager_id }))}
        islandVillagers={islandVillagerIds}
        hotelTourists={hotelTourists}
        bingoCardSize={bingoCardSize}
        username={username}
        huntName={hunt.hunt_name}
        onRestoreCard={bingoCard.restoreCard}
        ownerFilters={ownerFilters}
        ownerDisplayName={displayName}
        ownerRemoveFreeSpace={hunt.bingo_remove_free_space ?? false}
        huntId={hunt.hunt_id}
      />
    </Stack>
  );
}
