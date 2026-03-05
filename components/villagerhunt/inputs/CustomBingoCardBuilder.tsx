"use client";

import * as React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Alert,
} from '@mui/material';
import Image from 'next/image';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VillagerAutocomplete from './VillagerAutocomplete';
import type { Villager } from '@/types/villagerhunt';

type Props = {
  villagers: Villager[];
  bingoCardSize: number;
  onSave: (villagerIds: number[]) => void;
  onCancel: () => void;
  removeFreeSpace?: boolean;
};

export default function CustomBingoCardBuilder({
  villagers,
  bingoCardSize,
  onSave,
  onCancel,
  removeFreeSpace = false,
}: Props) {
  const totalSquares = bingoCardSize * bingoCardSize;
  const hasFreeSpace = !removeFreeSpace && (bingoCardSize === 3 || bingoCardSize === 5);
  const freeSpaceIndex = hasFreeSpace ? Math.floor(totalSquares / 2) : -1;
  const requiredSquares = totalSquares - (hasFreeSpace ? 1 : 0);

  // Track selected villagers for each square (excludes free space)
  const [selectedVillagers, setSelectedVillagers] = React.useState<(Villager | null)[]>(
    Array(requiredSquares).fill(null)
  );
  
  const [activeSquareIndex, setActiveSquareIndex] = React.useState<number | null>(null);

  // Get villager IDs that are already selected (to prevent duplicates)
  const selectedVillagerIds = React.useMemo(() => {
    return selectedVillagers
      .filter((v): v is Villager => v !== null)
      .map(v => v.villager_id);
  }, [selectedVillagers]);

  const handleSquareClick = (squareIndex: number) => {
    // Convert grid square index to villager array index (accounting for free space)
    let villagerIndex = squareIndex;
    if (hasFreeSpace && squareIndex > freeSpaceIndex) {
      villagerIndex = squareIndex - 1;
    }
    setActiveSquareIndex(villagerIndex);
  };

  const handleVillagerSelect = (villager: Villager | null) => {
    if (activeSquareIndex === null) return;
    
    const newSelected = [...selectedVillagers];
    newSelected[activeSquareIndex] = villager;
    setSelectedVillagers(newSelected);
    setActiveSquareIndex(null);
  };

  const handleSave = () => {
    const villagerIds = selectedVillagers
      .filter((v): v is Villager => v !== null)
      .map(v => v.villager_id);
    onSave(villagerIds);
  };

  const filledCount = selectedVillagers.filter(v => v !== null).length;
  const isComplete = filledCount === requiredSquares;

  const getSquareSize = () => {
    if (bingoCardSize === 3) return 120;
    if (bingoCardSize === 4) return 100;
    return 90; // 5x5
  };

  const squareSize = getSquareSize();

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Click each square to select a villager. Progress: <strong>{filledCount}/{requiredSquares}</strong> squares filled.
      </Alert>

      {/* Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${bingoCardSize}, ${squareSize}px)`,
          gap: 1,
          mx: 'auto',
          width: 'fit-content',
          mb: 3,
        }}
      >
        {Array.from({ length: totalSquares }).map((_, index) => {
          const isFreeSpace = index === freeSpaceIndex;
          
          if (isFreeSpace) {
            return (
              <Paper
                key={index}
                elevation={2}
                sx={{
                  width: squareSize,
                  height: squareSize,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'success.light',
                  color: 'success.contrastText',
                  fontWeight: 'bold',
                  fontSize: bingoCardSize === 3 ? '1.2rem' : '1rem',
                }}
              >
                FREE
              </Paper>
            );
          }

          // Calculate villager index (accounting for free space)
          let villagerIndex = index;
          if (hasFreeSpace && index > freeSpaceIndex) {
            villagerIndex = index - 1;
          }

          const selectedVillager = selectedVillagers[villagerIndex];
          const isFilled = selectedVillager !== null;

          return (
            <Paper
              key={index}
              elevation={isFilled ? 3 : 1}
              onClick={() => handleSquareClick(index)}
              sx={{
                width: squareSize,
                height: squareSize,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                bgcolor: isFilled ? 'background.paper' : 'grey.100',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  zIndex: 1,
                  boxShadow: 4,
                },
              }}
            >
              {isFilled ? (
                <>
                  <Box
                    sx={{
                      position: 'relative',
                      width: squareSize * 0.5,
                      height: squareSize * 0.5,
                      mb: 0.5,
                    }}
                  >
                    <Image
                      src={selectedVillager.image_url || '/placeholder.png'}
                      alt={selectedVillager.name}
                      fill
                      style={{ objectFit: 'contain' }}
                      unoptimized
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: bingoCardSize === 5 ? '0.6rem' : '0.7rem',
                      textAlign: 'center',
                      px: 0.5,
                      lineHeight: 1.1,
                    }}
                  >
                    {selectedVillager.name}
                  </Typography>
                  <CheckCircleIcon
                    sx={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      fontSize: '1rem',
                      color: 'success.main',
                    }}
                  />
                </>
              ) : (
                <>
                  <AddIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                  <Typography variant="caption" color="text.secondary">
                    Select
                  </Typography>
                </>
              )}
            </Paper>
          );
        })}
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          fullWidth
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!isComplete}
          fullWidth
        >
          Save Custom Card
        </Button>
      </Box>

      {/* Villager Selection Dialog */}
      <Dialog
        open={activeSquareIndex !== null}
        onClose={() => setActiveSquareIndex(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Select Villager for Square {activeSquareIndex !== null ? activeSquareIndex + 1 : ''}
            </Typography>
            <IconButton onClick={() => setActiveSquareIndex(null)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <VillagerAutocomplete
            villagers={villagers}
            value={activeSquareIndex !== null ? selectedVillagers[activeSquareIndex] : null}
            onChange={(value) => {
              // VillagerAutocomplete can return array when multiple=true, but we're in single mode
              if (Array.isArray(value)) return;
              handleVillagerSelect(value);
            }}
            label="Search for a villager"
            excludeVillagerIds={selectedVillagerIds}
          />
          {activeSquareIndex !== null && selectedVillagers[activeSquareIndex] && (
            <Button
              variant="text"
              color="error"
              onClick={() => handleVillagerSelect(null)}
              sx={{ mt: 2 }}
              fullWidth
            >
              Clear Selection
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
