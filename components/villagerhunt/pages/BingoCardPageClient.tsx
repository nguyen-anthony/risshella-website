"use client";
import * as React from 'react';
import { Box, Button, Container, Typography, Alert, CircularProgress, ToggleButtonGroup, ToggleButton, Collapse, Paper } from '@mui/material';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CasinoIcon from '@mui/icons-material/Casino';
import BuildIcon from '@mui/icons-material/Build';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import ImageIcon from '@mui/icons-material/Image';
import type { Hunt } from '@/types/villagerhunt';
import { useVillagers, useBingoCard } from '@/components/villagerhunt/hooks';
import InteractiveBingoCard from '@/components/villagerhunt/displays/InteractiveBingoCard';
import BingoFilters from '@/components/villagerhunt/inputs/BingoFilters';
import CustomBingoCardBuilder from '@/components/villagerhunt/inputs/CustomBingoCardBuilder';
import { selectBingoVillagers, countMatchingVillagers, type BingoFilters as BingoFiltersType } from '@/utils/bingoCardGenerator';
import { downloadBingoCardImage } from '@/utils/villagerhunt/downloadBingoCardImage';

type Props = {
  hunt: Hunt | null;
  username: string;
  displayName: string;
};

export default function BingoCardPageClient({ hunt, username, displayName }: Props) {
  const { villagers } = useVillagers();
  const { villagers: allVillagers } = useVillagers({ includeAmiiboOnly: true });
  const bingoCard = useBingoCard(hunt?.hunt_id || '');
  const [generatingBingo, setGeneratingBingo] = React.useState(false);
  const [filters, setFilters] = React.useState<BingoFiltersType>(() => ({
    species: hunt?.bingo_filter_species || [],
    personalities: hunt?.bingo_filter_personalities || [],
  }));
  const [showFilters, setShowFilters] = React.useState(false);
  const [creationMode, setCreationMode] = React.useState<'generate' | 'custom'>('generate');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Resolve target villagers data
  const targetVillagers = React.useMemo(() => {
    if (!hunt?.target_villager_id || hunt.target_villager_id.length === 0) return [];
    return villagers.filter(v => hunt.target_villager_id.includes(v.villager_id));
  }, [hunt?.target_villager_id, villagers]);

  // Calculate required villagers count
  const bingoCardSize = hunt?.bingo_card_size || 5;
  const totalSquares = bingoCardSize * bingoCardSize;
  const freeSpaces = bingoCardSize === 3 || bingoCardSize === 5 ? 1 : 0;
  const requiredCount = totalSquares - freeSpaces;

  // Count available villagers matching current filters
  const availableCount = React.useMemo(() => {
    if (!hunt) return 0;
    return countMatchingVillagers({
      targetVillagers,
      islandVillagers: hunt.island_villagers,
      hotelTourists: hunt.hotel_tourists,
      villagers,
      filters: filters.species.length > 0 || filters.personalities.length > 0 ? filters : undefined,
    });
  }, [filters, targetVillagers, hunt, villagers]);

  // If no hunt, show error
  if (!hunt) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Button
          component={Link}
          href={`/villagerhunt/${username}`}
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 3 }}
        >
          Back to {displayName}&apos;s Hunt
        </Button>
        <Alert severity="error">
          {displayName} has no active hunt
        </Alert>
      </Container>
    );
  }

  const hasEnoughVillagers = availableCount >= requiredCount;
  const hasFilters = filters.species.length > 0 || filters.personalities.length > 0;

  // Owner filter helpers
  const ownerSpecies = hunt?.bingo_filter_species || [];
  const ownerPersonalities = hunt?.bingo_filter_personalities || [];
  const hasOwnerFilters = ownerSpecies.length > 0 || ownerPersonalities.length > 0;
  const isUsingOwnerFilters = hasOwnerFilters && (
    filters.species.length === ownerSpecies.length &&
    filters.personalities.length === ownerPersonalities.length &&
    filters.species.every(s => ownerSpecies.includes(s)) &&
    filters.personalities.every(p => ownerPersonalities.includes(p))
  );

  const handleGenerate = () => {
    setGeneratingBingo(true);
    try {
      const villagerIds = selectBingoVillagers({
        targetVillagers,
        islandVillagers: hunt.island_villagers,
        hotelTourists: hunt.hotel_tourists,
        villagers,
        bingoCardSize,
        filters: hasFilters ? filters : undefined,
      });
      bingoCard.generateCard(villagerIds, hunt.bingo_card_size);
    } catch (error) {
      console.error('Failed to generate bingo card:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate bingo card');
    } finally {
      setGeneratingBingo(false);
    }
  };

  const handleGenerateCustom = (villagerIds: number[]) => {
    bingoCard.generateCard(villagerIds, hunt.bingo_card_size);
  };

  const handleClearFilters = () => {
    setFilters({
      species: [],
      personalities: [],
    });
  };

  // Handle image download
  const handleDownloadImage = async () => {
    if (!bingoCard.cardData) return;
    await downloadBingoCardImage({
      villagers: allVillagers,
      villagerIds: bingoCard.cardData.villagerIds,
      markedSquares: bingoCard.cardData.markedSquares,
      size: bingoCard.cardData.size,
      title: `${username} - ${hunt.hunt_name}`,
    });
    
  const handleResetToOwnerFilters = () => {
    setFilters({ species: [...ownerSpecies], personalities: [...ownerPersonalities] });
  };

  // Handle backup/download
  const handleDownloadBackup = () => {
    if (!bingoCard.cardData) return;

    const backup = {
      ...bingoCard.cardData,
      username,
      huntName: hunt.hunt_name,
      backupDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `bingo-${username}-${hunt.hunt_name.replace(/\s+/g, '-')}-${dateStr}.json`;
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
        const backup = JSON.parse(content);
        
        if (!backup.villagerIds || !backup.markedSquares || !backup.size) {
          alert('Invalid backup file format');
          return;
        }

        bingoCard.restoreCard({
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
    event.target.value = '';
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 3 } }}>
      {/* Header with Back Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 2, sm: 3 } }}>
        <Button
          component={Link}
          href={`/villagerhunt/${username}`}
          startIcon={<ArrowBackIcon />}
          variant="outlined"
        >
          Back to Hunt
        </Button>
        <Typography variant="h5" fontWeight={600} sx={{ display: { xs: 'none', sm: 'block' } }}>
          {hunt.hunt_name} - Bingo Card
        </Typography>
      </Box>

      {/* Mobile Title */}
      <Typography variant="h6" fontWeight={600} sx={{ mb: { xs: 2, sm: 3 }, display: { xs: 'block', sm: 'none' } }}>
        {hunt.hunt_name} - Bingo Card
      </Typography>

      {/* Content */}
      {generatingBingo ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Generating your bingo card...
          </Typography>
        </Box>
      ) : bingoCard.cardData ? (
        <Box>
          <Alert severity="info" sx={{ mb: { xs: 2, sm: 3 }, display: { xs: 'none', sm: 'flex' } }}>
            Click on villager squares to mark them as found! Your progress is automatically saved.
          </Alert>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 2, sm: 4 } }}>
            <InteractiveBingoCard
              villagers={allVillagers}
              villagerIds={bingoCard.cardData.villagerIds}
              markedSquares={bingoCard.cardData.markedSquares}
              size={bingoCard.cardData.size}
              onSquareClick={bingoCard.toggleSquare}
            />
          </Box>

          {/* Card Actions */}
          <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
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
                {hasOwnerFilters && (
                  <Box sx={{ mb: 2 }}>
                    {isUsingOwnerFilters ? (
                      <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
                        Filters set by <strong>{displayName}</strong> are pre-applied.
                      </Alert>
                    ) : (
                      <Alert
                        severity="warning"
                        action={
                          <Button size="small" onClick={handleResetToOwnerFilters} sx={{ whiteSpace: 'nowrap' }}>
                            Reset
                          </Button>
                        }
                        sx={{ fontSize: '0.85rem' }}
                      >
                        You&apos;ve overridden <strong>{displayName}</strong>&apos;s filters.
                      </Alert>
                    )}
                  </Box>
                )}
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
                disabled={generatingBingo || !hasEnoughVillagers}
                fullWidth
              >
                Generate New Card
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={bingoCard.clearCard}
                disabled={generatingBingo}
                fullWidth
              >
                Clear Card
              </Button>
            </Box>

            {/* Download as Image */}
            <Button
              variant="outlined"
              startIcon={<ImageIcon />}
              onClick={handleDownloadImage}
              disabled={generatingBingo}
              fullWidth
              size="small"
              sx={{ mb: 2 }}
            >
              Download as Image
            </Button>

            {/* Backup/Restore Section */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="text"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadBackup}
                disabled={generatingBingo}
                fullWidth
                size="small"
              >
                Backup
              </Button>
              <Button
                variant="text"
                startIcon={<UploadIcon />}
                onClick={handleUploadBackup}
                disabled={generatingBingo}
                fullWidth
                size="small"
              >
                Restore
              </Button>
            </Box>
          </Paper>
        </Box>
      ) : (
        <Box>
          <Paper elevation={2} sx={{ p: { xs: 2, sm: 4 }, textAlign: 'center', mb: { xs: 2, sm: 3 } }}>
            <CasinoIcon sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Bingo Card Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Generate a bingo card to start tracking villagers during your hunt!
            </Typography>

            {/* Mode Toggle */}
            <ToggleButtonGroup
              value={creationMode}
              exclusive
              onChange={(_, newMode) => newMode && setCreationMode(newMode)}
              fullWidth
              sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}
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
              <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                {/* Owner filter notice */}
                {hasOwnerFilters && (
                  <Box sx={{ mb: 2 }}>
                    {isUsingOwnerFilters ? (
                      <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
                        Filters applied automatically by <strong>{displayName}</strong>. Expand filters below to override.
                      </Alert>
                    ) : (
                      <Alert
                        severity="warning"
                        action={
                          <Button size="small" onClick={handleResetToOwnerFilters} sx={{ whiteSpace: 'nowrap' }}>
                            Reset
                          </Button>
                        }
                        sx={{ fontSize: '0.85rem' }}
                      >
                        You&apos;ve overridden <strong>{displayName}</strong>&apos;s filters.
                      </Alert>
                    )}
                  </Box>
                )}

                <Button
                  variant="text"
                  startIcon={<FilterListIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  {showFilters ? 'Hide Filters' : (hasOwnerFilters ? 'Override Filters' : 'Show Filters (Optional)')}
                </Button>

                <Collapse in={showFilters}>
                  <BingoFilters
                    filters={filters}
                    onChange={setFilters}
                    availableCount={availableCount}
                    requiredCount={requiredCount}
                  />
                  {hasFilters && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="text"
                        onClick={handleClearFilters}
                        fullWidth
                        sx={{ mb: 2 }}
                      >
                        Clear All Filters
                      </Button>
                      {hasOwnerFilters && !isUsingOwnerFilters && (
                        <Button
                          variant="text"
                          onClick={handleResetToOwnerFilters}
                          fullWidth
                          sx={{ mb: 2 }}
                        >
                          Reset to {displayName}&apos;s Filters
                        </Button>
                      )}
                    </Box>
                  )}
                </Collapse>

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
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    Not enough villagers match your filters
                  </Typography>
                )}
              </Box>
            ) : (
              <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                <CustomBingoCardBuilder
                  villagers={villagers.filter(v => 
                    !targetVillagers.some(tv => tv.villager_id === v.villager_id) &&
                    !hunt.island_villagers.includes(v.villager_id) &&
                    !hunt.hotel_tourists.includes(v.villager_id) &&
                    !v.amiibo_only
                  )}
                  bingoCardSize={hunt.bingo_card_size}
                  onSave={handleGenerateCustom}
                  onCancel={() => setCreationMode('generate')}
                />
              </Box>
            )}
          </Paper>

          {/* Restore from backup option */}
          <Paper elevation={2} sx={{ p: 2 }}>
            <Button
              variant="text"
              startIcon={<UploadIcon />}
              onClick={handleUploadBackup}
              disabled={generatingBingo}
              fullWidth
              size="small"
            >
              Restore Card from Backup
            </Button>
          </Paper>
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
    </Container>
  );
}
