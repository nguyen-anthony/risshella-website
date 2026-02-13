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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CasinoIcon from '@mui/icons-material/Casino';
import InteractiveBingoCard from '../displays/InteractiveBingoCard';
import type { Villager } from '@/types/villagerhunt';
import type { BingoCardData } from '../hooks/useBingoCard';

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerate: () => void;
  onClear: () => void;
  cardData: BingoCardData | null;
  villagers: Villager[];
  onSquareClick: (index: number) => void;
  loading: boolean;
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
}: Props) {
  // Calculate drawer width based on card size
  const getDrawerWidth = () => {
    if (!cardData) return 400;
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
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CasinoIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Bingo Card Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Generate a bingo card to start tracking villagers during your hunt!
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<CasinoIcon />}
              onClick={onGenerate}
            >
              Generate Bingo Card
            </Button>
          </Box>
        )}
      </Box>

      {/* Footer Actions */}
      {cardData && !loading && (
        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={onGenerate}
              disabled={loading}
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
