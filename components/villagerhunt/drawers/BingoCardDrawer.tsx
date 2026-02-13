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
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CasinoIcon from '@mui/icons-material/Casino';
import FilterListIcon from '@mui/icons-material/FilterList';
import BuildIcon from '@mui/icons-material/Build';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import InteractiveBingoCard from '../displays/InteractiveBingoCard';
import BingoFilters from '../inputs/BingoFilters';
import CustomBingoCardBuilder from '../inputs/CustomBingoCardBuilder';
import { countMatchingVillagers, type BingoFilters as BingoFiltersType } from '@/utils/bingoCardGenerator';
import type { Villager } from '@/types/villagerhunt';
import type { BingoCardData } from '../hooks/useBingoCard';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerate: (filters?: BingoFiltersType) => void;
  onGenerateCustom: (villagerIds: number[]) => void;
  onClear: () => void;
  cardData: BingoCardData | null;
  villagers: Villager[];
  onSquareClick: (index: number) => void;
  loading: boolean;
  targetVillagers: { villager_id: number }[];
  islandVillagers: number[];
  hotelTourists: number[];
  bingoCardSize: number;
  username: string;
  huntName: string;
  onRestoreCard: (cardData: BingoCardData) => void;
};

export default function BingoCardDrawer({
  open,
  onClose,
  onGenerate,
  onGenerateCustom,
  onClear,
  cardData,
  villagers,
  onSquareClick,
  loading,
  targetVillagers,
  islandVillagers,
  hotelTourists,
  bingoCardSize,
  username,
  huntName,
  onRestoreCard,
}: Props) {
  const [filters, setFilters] = React.useState<BingoFiltersType>({
    species: [],
    personalities: [],
  });
  const [showFilters, setShowFilters] = React.useState(false);
  const [creationMode, setCreationMode] = React.useState<'generate' | 'custom'>('generate');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Handle backup/download
  const handleDownloadBackup = () => {
    if (!cardData) return;

    const backup = {
      ...cardData,
      username,
      huntName,
      backupDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `bingo-${username}-${huntName.replace(/\s+/g, '-')}-${dateStr}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handle restore/upload
  const handleUploadBackup = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const backup = JSON.parse(content) as BingoCardData & { username?: string; huntName?: string; backupDate?: string };
        
        // Validate the backup data
        if (!backup.villagerIds || !backup.markedSquares || !backup.size) {
          alert('Invalid backup file format');
          return;
        }

        // Restore the card data
        onRestoreCard({
          villagerIds: backup.villagerIds,
          markedSquares: backup.markedSquares,
          size: backup.size,
          generatedAt: backup.generatedAt || Date.now(),
        });

        alert('Bingo card restored successfully!');
      } catch (error) {
        console.error('Failed to restore backup:', error);
        alert('Failed to restore backup. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset input so the same file can be selected again
    event.target.value = '';
  };

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
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.0)', // Reduced from default 0.5
          },
        },
      }}
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
            Interactive Bingo Card
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

            {/* Mode Toggle */}
            <ToggleButtonGroup
              value={creationMode}
              exclusive
              onChange={(_, newMode) => newMode && setCreationMode(newMode)}
              fullWidth
              sx={{ mb: 3 }}
            >
              <ToggleButton value="generate">
                <CasinoIcon sx={{ mr: 1 }} />
                Generate Random
              </ToggleButton>
              <ToggleButton value="custom">
                <BuildIcon sx={{ mr: 1 }} />
                Create Custom
              </ToggleButton>
            </ToggleButtonGroup>

            {creationMode === 'generate' ? (
              <Box>
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
            ) : (
              <CustomBingoCardBuilder
                villagers={villagers.filter(v => 
                  !targetVillagers.some(tv => tv.villager_id === v.villager_id) &&
                  !islandVillagers.includes(v.villager_id) &&
                  !hotelTourists.includes(v.villager_id) &&
                  !v.amiibo_only
                )}
                bingoCardSize={bingoCardSize}
                onSave={onGenerateCustom}
                onCancel={() => setCreationMode('generate')}
              />
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

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
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

          {/* Backup/Restore Section */}
          <Divider sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Backup & Restore
            </Typography>
          </Divider>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="text"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadBackup}
              disabled={loading}
              fullWidth
              size="small"
            >
              Backup
            </Button>
            <Button
              variant="text"
              startIcon={<UploadIcon />}
              onClick={handleUploadBackup}
              disabled={loading}
              fullWidth
              size="small"
            >
              Restore
            </Button>
          </Box>
        </Box>
      )}

      {/* Restore Card - Always Available when no card */}
      {!cardData && !loading && (
        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            variant="text"
            startIcon={<UploadIcon />}
            onClick={handleUploadBackup}
            disabled={loading}
            fullWidth
            size="small"
          >
            Restore Card from Backup
          </Button>
        </Box>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </Drawer>
  );
}
