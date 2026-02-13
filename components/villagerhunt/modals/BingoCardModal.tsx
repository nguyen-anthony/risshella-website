"use client";

import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import InteractiveBingoCard from '../displays/InteractiveBingoCard';
import type { Villager } from '@/types/villagerhunt';
import type { BingoCardData } from '../hooks/useBingoCard';

type Props = {
  open: boolean;
  onClose: () => void;
  onRegenerate?: () => void;
  onClear?: () => void;
  cardData: BingoCardData | null;
  villagers: Villager[];
  onSquareClick: (index: number) => void;
  loading: boolean;
};

export default function BingoCardModal({
  open,
  onClose,
  onRegenerate,
  onClear,
  cardData,
  villagers,
  onSquareClick,
  loading,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {loading ? 'Generating Bingo Card...' : 'Your Bingo Card'}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1">Generating your bingo card...</Typography>
          </Box>
        ) : cardData ? (
          <Box sx={{ py: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Click on villager squares to mark them as found! Your progress is automatically saved.
            </Alert>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
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
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="error">
              Failed to generate bingo card. Please try again.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {onClear && cardData && (
          <Button onClick={onClear} color="error" disabled={loading}>
            Clear Card
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose}>Close</Button>
        {onRegenerate && (
          <Button onClick={onRegenerate} variant="outlined" disabled={loading}>
            {loading ? 'Generating...' : 'Generate New Card'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}