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
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CasinoIcon from '@mui/icons-material/Casino';
import FilterListIcon from '@mui/icons-material/FilterList';
import BuildIcon from '@mui/icons-material/Build';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Link from 'next/link';
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

  // Detect if there's enough vertical space to show controls expanded
  const hasTallScreen = useMediaQuery('(min-height: 900px)');
  const [showControls, setShowControls] = React.useState(hasTallScreen);

  // Update showControls when screen size changes or card data changes
  React.useEffect(() => {
    if (cardData && hasTallScreen) {
      setShowControls(true);
    } else if (!hasTallScreen) {
      setShowControls(false);
    }
  }, [cardData, hasTallScreen]);

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
      variant="persistent"
      hideBackdrop={true}
      ModalProps={{
        keepMounted: false,
      }}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100vw', sm: `${getDrawerWidth()}px` },
          p: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 1, sm: 2 }, flexShrink: 0 }}>
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

      <Divider sx={{ mb: { xs: 1, sm: 2 }, flexShrink: 0 }} />

      {/* Info Alert - Hidden on small screens OR when controls are shown */}
      {cardData && !loading && !showControls && (
        <Alert severity="info" sx={{ mb: 2, fontSize: '0.875rem', display: { xs: 'none', sm: 'flex' }, flexShrink: 0 }}>
          Bingo cards are saved on your browser. Highly recommend using backup/restore options.
        </Alert>
      )}

      {/* Full Screen Mode Button - Always visible when card exists */}
      {cardData && !loading && (
        <Button
          component={Link}
          href={`/villagerhunt/${username}/bingocard`}
          variant="outlined"
          startIcon={<OpenInNewIcon />}
          fullWidth
          size="small"
          sx={{ mb: { xs: 1, sm: 2 }, flexShrink: 0 }}
        >
          Full Screen Mode
        </Button>
      )}

      {/* Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Generating your bingo card...
            </Typography>
          </Box>
        ) : cardData ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, sm: 2 }, minHeight: 0, flex: 1, overflow: 'hidden' }}>
            {/* Bingo Card - Static, centered, scales to fit */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              flexShrink: 1,
              flexGrow: 1,
              minHeight: 0,
              overflow: 'hidden',
              alignItems: 'center',
            }}>
              <InteractiveBingoCard
                villagers={villagers}
                villagerIds={cardData.villagerIds}
                markedSquares={cardData.markedSquares}
                size={cardData.size}
                onSquareClick={onSquareClick}
              />
            </Box>

            {/* Collapsible Controls Section */}
            <Box sx={{ flexShrink: 0, flexGrow: 0 }}>
              <Button
                variant="text"
                onClick={() => setShowControls(!showControls)}
                fullWidth
                endIcon={showControls ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                size="small"
              >
                {showControls ? 'Hide' : 'Show'} Card Controls
              </Button>
              
              <Collapse in={showControls}>
                <Box sx={{ pt: { xs: 1, sm: 2 }, maxHeight: '40vh', overflowY: 'auto' }}>
                  {/* Show filters when regenerating */}
                  <Button
                    variant="text"
                    startIcon={<FilterListIcon />}
                    onClick={() => setShowFilters(!showFilters)}
                    fullWidth
                    sx={{ mb: { xs: 1, sm: 2 } }}
                    size="small"
                  >
                    {showFilters ? 'Hide Filters' : 'Show Filters for New Card'}
                  </Button>

                  <Collapse in={showFilters}>
                    <Box sx={{ mb: { xs: 1, sm: 2 } }}>
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

                  <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, mb: { xs: 2, sm: 3 } }}>
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
                  <Divider sx={{ mb: { xs: 1, sm: 2 } }}>
                    <Typography variant="caption" color="text.secondary">
                      Backup & Restore
                    </Typography>
                  </Divider>

                  <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 } }}>
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
              </Collapse>
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

      {/* Restore Card - Always Available when no card */}
      {!cardData && !loading && (
        <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider', flexShrink: 0 }}>
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
