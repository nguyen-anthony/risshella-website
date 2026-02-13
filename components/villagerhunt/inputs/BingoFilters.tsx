"use client";

import * as React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  Typography,
  Alert,
} from '@mui/material';
import { VILLAGER_SPECIES, VILLAGER_PERSONALITIES } from '@/constants/villagers';
import type { BingoFilters as BingoFiltersType } from '@/utils/bingoCardGenerator';

type Props = {
  filters: BingoFiltersType;
  onChange: (filters: BingoFiltersType) => void;
  availableCount: number;
  requiredCount: number;
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default function BingoFilters({
  filters,
  onChange,
  availableCount,
  requiredCount,
}: Props) {
  const handleSpeciesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onChange({
      ...filters,
      species: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handlePersonalitiesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onChange({
      ...filters,
      personalities: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const hasFilters = filters.species.length > 0 || filters.personalities.length > 0;
  const hasEnoughVillagers = availableCount >= requiredCount;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
        Filter Options (Optional)
      </Typography>

      {/* Species Filter */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="species-filter-label">Species</InputLabel>
        <Select
          labelId="species-filter-label"
          id="species-filter"
          multiple
          value={filters.species}
          onChange={handleSpeciesChange}
          input={<OutlinedInput label="Species" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} size="small" />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {VILLAGER_SPECIES.map((species) => (
            <MenuItem key={species} value={species}>
              {species}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Personality Filter */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="personality-filter-label">Personality</InputLabel>
        <Select
          labelId="personality-filter-label"
          id="personality-filter"
          multiple
          value={filters.personalities}
          onChange={handlePersonalitiesChange}
          input={<OutlinedInput label="Personality" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} size="small" />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {VILLAGER_PERSONALITIES.map((personality) => (
            <MenuItem key={personality} value={personality}>
              {personality}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Validation Info */}
      {hasFilters && (
        <Alert 
          severity={hasEnoughVillagers ? "info" : "warning"}
          sx={{ mb: 2 }}
        >
          {hasEnoughVillagers ? (
            <Typography variant="body2">
              <strong>{availableCount} villagers</strong> match your filters. Need {requiredCount} for card.
            </Typography>
          ) : (
            <Typography variant="body2">
              Only <strong>{availableCount} villagers</strong> match your filters. Need at least {requiredCount} for a {Math.sqrt(requiredCount + (requiredCount === 8 || requiredCount === 24 ? 1 : 0))}×{Math.sqrt(requiredCount + (requiredCount === 8 || requiredCount === 24 ? 1 : 0))} card. Select more options or clear filters.
            </Typography>
          )}
        </Alert>
      )}

      {!hasFilters && (
        <Typography variant="caption" color="text.secondary">
          Leave filters empty to include all available villagers
        </Typography>
      )}
    </Box>
  );
}
