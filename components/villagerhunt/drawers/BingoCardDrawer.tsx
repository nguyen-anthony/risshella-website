"use client";

import * as React from 'react';
import {
  Drawer,
  Box,
  Typography,
  Button,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Collapse,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CasinoIcon from '@mui/icons-material/Casino';
import FilterListIcon from '@mui/icons-material/FilterList';
import InteractiveBingoCard from '../displays/InteractiveBingoCard';
import BingoFilters from '../inputs/BingoFilters';
import { countMatchingVillagers, type BingoFilters as BingoFiltersType } from '@/utils/bingoCardGenerator';
import type { Villager } from '@/types/villagerhunt';
import type { BingoCardData } from '../hooks/useBingoCard';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerate: (filters?: BingoFiltersType) => void;
  onClear: () => void;
  cardData: BingoCardData | null;
  villagers: Villager[];
  onSquareClick: (index: number) => void;
  loading: boolean;
  targetVillagers: { villager_id: number }[];
  islandVillagers: number[];
  hotelTourists: number[];
  bingoCardSize: number;
};

export default function BingoCardDrawer({
  open,
  onClose,
  onGenerate,
  onClear,
  cardData,
  villagers,
  onSquareClick,
  loading,
  targetVillagers,
  islandVillagers,
  hotelTourists,
  bingoCardSize,
}: Props) {
  const [filters, setFilters] = React.useState<BingoFiltersType>({
    species: [],
    personalities: [],
  });
  const [showFilters, setShowFilters] = React.useState(false);

  // Calculate required villagers for the card
  const totalSquares = bingoCardSize * bingoCardSize;
  const freeSpaces = bingoCardSize === 3 || bingoCardSize === 5 ? 1 : 0;
  const requiredCount = totalSquares - freeSpaces;

  // Count available villagers matching current filters
  const availableCount = React.useMemo(() => {
    return countMatchingVillagers({
      targetVillagers,
      islandVillagers,
      hotelTourists,
      villagers,
      filters: filters.species.length > 0 || filters.personalities.length > 0 ? filters : undefined,
    });
  }, [filters, targetVillagers, islandVillagers, hotelTourists, villagers]);

  const hasEnoughVillagers = availableCount >= requiredCount;
  const hasFilters = filters.species.length > 0 || filters.personalities.length > 0;

  const handleGenerate = () => {
    onGenerate(hasFilters ? filters : undefined);
  };

  const handleClearFilters = () => {
    setFilters({
      species: [],
      personalities: [],
    });
  };

  // Calculate drawer width based on card size
  const getDrawerWidth = () => {
    if (!cardData) return 500;
    if (cardData.size === 3) return 480;
    if (cardData.size === 4) return 560;
    return 640; // 5x5
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100vw', sm: `${getDrawerWidth()}px` },
          p: 3,
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CasinoIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Bingo Card
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Generating your bingo card...
            </Typography>
          </Box>
        ) : cardData ? (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Click on villager squares to mark them as found! Your progress is automatically saved.
            </Alert>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <InteractiveBingoCard
                villagers={villagers}
                villagerIds={cardData.villagerIds}
                markedSquares={cardData.markedSquares}
                size={cardData.size}
                onSquareClick={onSquareClick}
              />
            </Box>
          </Box>
        ) : (
          <Box>
            <CasinoIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2, display: 'block', mx: 'auto' }} />
            <Typography variant="h6" gutterBottom textAlign="center">
              No Bingo Card Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              Generate a bingo card to start tracking villagers during your hunt!
            </Typography>

            {/* Filter Toggle */}
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              fullWidth
              sx={{ mb: 2 }}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters (Optional)'}
            </Button>

            {/* Filters */}
            <Collapse in={showFilters}>
              <BingoFilters
                filters={filters}
                onChange={setFilters}
                availableCount={availableCount}
                requiredCount={requiredCount}
              />
              {hasFilters && (
                <Button
                  variant="text"
                  onClick={handleClearFilters}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Clear All Filters
                </Button>
              )}
            </Collapse>

            {/* Generate Button */}
            <Button
              variant="contained"
              size="large"
              startIcon={<CasinoIcon />}
              onClick={handleGenerate}
              disabled={!hasEnoughVillagers}
              fullWidth
            >
              Generate Bingo Card
            </Button>

            {!hasEnoughVillagers && hasFilters && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                Not enough villagers match your filters
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Footer Actions */}
      {cardData && !loading && (
        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          {/* Show filters when regenerating */}
          <Button
            variant="text"
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
            fullWidth
            sx={{ mb: 2 }}
            size="small"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters for New Card'}
          </Button>

          <Collapse in={showFilters}>
            <Box sx={{ mb: 2 }}>
              <BingoFilters
                filters={filters}
                onChange={setFilters}
                availableCount={availableCount}
                requiredCount={requiredCount}
              />
              {hasFilters && (
                <Button
                  variant="text"
                  onClick={handleClearFilters}
                  fullWidth
                  size="small"
                  sx={{ mb: 1 }}
                >
                  Clear All Filters
                </Button>
              )}
            </Box>
          </Collapse>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleGenerate}
              disabled={loading || !hasEnoughVillagers}
              fullWidth
            >
              Generate New Card
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={onClear}
              disabled={loading}
              fullWidth
            >
              Clear Card
            </Button>
          </Box>
        </Box>
      )}
    </Drawer>
  );
}
