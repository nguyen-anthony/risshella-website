"use client";
import * as React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

type Props = {
  isVisible: boolean;
  onClose: () => void;
};

export default function InactiveHuntNotification({ isVisible, onClose }: Props) {
  if (!isVisible) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      {/* Character Image */}
      <Box
        component="img"
        src="/ront_character.png"
        alt="Ront Character"
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          border: '2px solid #fff',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        }}
      />

      {/* Speech Bubble */}
      <Box
        sx={{
          position: 'relative',
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '12px 16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          maxWidth: 300,
          '&::before': {
            content: '""',
            position: 'absolute',
            left: -8,
            bottom: 20,
            width: 0,
            height: 0,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: '8px solid #fff',
          },
        }}
      >
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            padding: 0.5,
            color: 'black',
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        <Typography variant="body2" sx={{ color: 'black', pr: 2 }}>
          Welcome back! This hunt is inactive, but once you add an encounter, it&apos;ll flip back to active!
        </Typography>
      </Box>
    </Box>
  );
}
