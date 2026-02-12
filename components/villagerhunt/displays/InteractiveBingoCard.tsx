"use client";
import * as React from 'react';
import { Box, Typography, Paper, Tooltip } from '@mui/material';
import Image from 'next/image';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { Villager } from '@/types/villagerhunt';

type Props = {
  villagers: Villager[];
  villagerIds: number[];
  markedSquares: boolean[];
  size: number;
  onSquareClick: (index: number) => void;
  readonly?: boolean;
};

export default function InteractiveBingoCard({
  villagers,
  villagerIds,
  markedSquares,
  size,
  onSquareClick,
  readonly = false,
}: Props) {
  // Create a map for quick villager lookup
  const villagerMap = React.useMemo(() => {
    const map = new Map<number, Villager>();
    villagers.forEach(v => map.set(v.villager_id, v));
    return map;
  }, [villagers]);

  // Determine if there's a free space (center square for 3x3 and 5x5)
  const hasFreeSpace = size === 3 || size === 5;
  const freeSpaceIndex = hasFreeSpace ? Math.floor((size * size) / 2) : -1;

  // Calculate appropriate square size based on grid size
  const getSquareSize = () => {
    if (size === 3) return 140;
    if (size === 4) return 120;
    return 100; // 5x5
  };

  const squareSize = getSquareSize();

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${size}, ${squareSize}px)`,
        gap: 1,
        mx: 'auto',
        width: 'fit-content',
      }}
    >
      {Array.from({ length: size * size }).map((_, index) => {
        const isFreeSpace = index === freeSpaceIndex;
        const isMarked = markedSquares[index];
        
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
                fontSize: size === 3 ? '1.5rem' : '1.2rem',
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

        const villagerId = villagerIds[villagerIndex];
        const villager = villagerMap.get(villagerId);

        if (!villager) {
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
                bgcolor: 'grey.300',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                ???
              </Typography>
            </Paper>
          );
        }

        return (
          <Tooltip key={index} title={readonly ? villager.name : `Click to ${isMarked ? 'unmark' : 'mark'} ${villager.name}`}>
            <Paper
              elevation={isMarked ? 4 : 2}
              onClick={() => !readonly && onSquareClick(index)}
              sx={{
                width: squareSize,
                height: squareSize,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                cursor: readonly ? 'default' : 'pointer',
                bgcolor: isMarked ? 'success.light' : 'background.paper',
                transition: 'all 0.2s ease-in-out',
                '&:hover': readonly ? {} : {
                  transform: 'scale(1.05)',
                  zIndex: 1,
                  boxShadow: 4,
                },
                opacity: isMarked ? 0.85 : 1,
              }}
            >
              {/* Villager Image */}
              <Box
                sx={{
                  position: 'relative',
                  width: squareSize * 0.6,
                  height: squareSize * 0.6,
                  mb: 0.5,
                }}
              >
                <Image
                  src={villager.image_url || '/placeholder.png'}
                  alt={villager.name}
                  fill
                  style={{ objectFit: 'contain' }}
                  unoptimized
                />
              </Box>

              {/* Villager Name */}
              <Typography
                variant="caption"
                sx={{
                  fontSize: size === 5 ? '0.65rem' : '0.75rem',
                  textAlign: 'center',
                  px: 0.5,
                  fontWeight: isMarked ? 'bold' : 'normal',
                  lineHeight: 1.2,
                }}
              >
                {villager.name}
              </Typography>

              {/* Check Mark Overlay */}
              {isMarked && (
                <CheckCircleIcon
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    fontSize: size === 5 ? '1.2rem' : '1.5rem',
                    color: 'success.main',
                    bgcolor: 'background.paper',
                    borderRadius: '50%',
                  }}
                />
              )}
            </Paper>
          </Tooltip>
        );
      })}
    </Box>
  );
}
