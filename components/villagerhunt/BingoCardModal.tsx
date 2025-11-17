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
} from '@mui/material';

type Props = {
  open: boolean;
  onClose: () => void;
  onRegenerate?: () => void;
  bingoCardImage: string | null;
  loading: boolean;
};

export default function BingoCardModal({
  open,
  onClose,
  onRegenerate,
  bingoCardImage,
  loading,
}: Props) {
  const handleDownload = () => {
    if (!bingoCardImage) return;

    const link = document.createElement('a');
    link.download = `villager-hunt-bingo-${Date.now()}.png`;
    link.href = bingoCardImage;
    link.click();
  };

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
        ) : bingoCardImage ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Box
              component="img"
              src={bingoCardImage}
              alt="Bingo Card"
              sx={{
                maxWidth: '100%',
                maxHeight: '60vh',
                border: '1px solid #ddd',
                borderRadius: 1,
                boxShadow: 2,
              }}
            />
            <Typography variant="body1" color="warning" sx={{ mt: 2 }}>
              Please download/save this image. This bingo card will NOT save!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Right-click the image to save, or use the download button below.
            </Typography>
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
        <Button onClick={onClose}>Close</Button>
        {onRegenerate && bingoCardImage && (
          <Button onClick={onRegenerate} variant="outlined" disabled={loading}>
            {loading ? 'Generating...' : 'Generate New Card'}
          </Button>
        )}
        {bingoCardImage && (
          <Button onClick={handleDownload} variant="contained">
            Download Image
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}