"use client";
import * as React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  OutlinedInput,
  Divider,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { VILLAGER_SPECIES, VILLAGER_PERSONALITIES } from "@/constants/villagers";
import { countMatchingVillagers, type BingoFilters } from "@/utils/bingoCardGenerator";
import type { Villager } from "@/types/villagerhunt";

type Props = {
  open: boolean;
  onClose: () => void;
  isBingoEnabled: boolean;
  bingoCardSize: number;
  bingoFilterSpecies: string[];
  bingoFilterPersonalities: string[];
  villagers: Villager[];
  targetVillagers: { villager_id: number }[];
  islandVillagers: number[];
  hotelTourists: number[];
  onSave: (isEnabled: boolean, size: number, filters: BingoFilters) => void;
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

export default function BingoCardControlModal({
  open,
  onClose,
  isBingoEnabled,
  bingoCardSize,
  bingoFilterSpecies,
  bingoFilterPersonalities,
  villagers,
  targetVillagers,
  islandVillagers,
  hotelTourists,
  onSave,
}: Props) {
  const [enabled, setEnabled] = React.useState(isBingoEnabled);
  const [size, setSize] = React.useState(bingoCardSize);
  const [filterSpecies, setFilterSpecies] = React.useState<string[]>(bingoFilterSpecies ?? []);
  const [filterPersonalities, setFilterPersonalities] = React.useState<string[]>(bingoFilterPersonalities ?? []);

  React.useEffect(() => {
    if (open) {
      setEnabled(isBingoEnabled);
      setSize(bingoCardSize);
      setFilterSpecies(bingoFilterSpecies ?? []);
      setFilterPersonalities(bingoFilterPersonalities ?? []);
    }
  }, [open, isBingoEnabled, bingoCardSize, bingoFilterSpecies, bingoFilterPersonalities]);

  const handleSpeciesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFilterSpecies(typeof value === 'string' ? value.split(',') : value);
  };

  const handlePersonalitiesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFilterPersonalities(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSave = () => {
    onSave(enabled, size, { species: filterSpecies, personalities: filterPersonalities });
    onClose();
  };

  // Live availability count
  const hasActiveFilters = filterSpecies.length > 0 || filterPersonalities.length > 0;
  const availableCount = React.useMemo(() => {
    if (!enabled) return 0;
    return countMatchingVillagers({
      targetVillagers,
      islandVillagers,
      hotelTourists,
      villagers,
      filters: hasActiveFilters ? { species: filterSpecies, personalities: filterPersonalities } : undefined,
    });
  }, [enabled, filterSpecies, filterPersonalities, targetVillagers, islandVillagers, hotelTourists, villagers, hasActiveFilters]);

  const totalSquares = size * size;
  const freeSpaces = size === 3 || size === 5 ? 1 : 0;
  const requiredCount = totalSquares - freeSpaces;
  const hasEnoughVillagers = availableCount >= requiredCount;

  return (
    <Dialog open={open} onClose={onClose} sx={{ '& .MuiDialog-paper': { minWidth: '440px' } }}>
      <DialogTitle>Bingo Card Settings</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
            }
            label="Enable Bingo Card Generation"
          />
          <FormControl fullWidth>
            <InputLabel>Bingo Card Size</InputLabel>
            <Select
              value={size}
              label="Bingo Card Size"
              onChange={(e) => setSize(Number(e.target.value))}
              disabled={!enabled}
            >
              <MenuItem value={3}>3x3</MenuItem>
              <MenuItem value={4}>4x4</MenuItem>
              <MenuItem value={5}>5x5</MenuItem>
            </Select>
          </FormControl>

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Default Bingo Villager Filters
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Pre-apply species and personality filters for anyone generating a bingo card for your hunt! Viewers can still override these.
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }} disabled={!enabled}>
              <InputLabel id="owner-species-filter-label">Species</InputLabel>
              <Select
                labelId="owner-species-filter-label"
                multiple
                value={filterSpecies}
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

            <FormControl fullWidth disabled={!enabled}>
              <InputLabel id="owner-personality-filter-label">Personality</InputLabel>
              <Select
                labelId="owner-personality-filter-label"
                multiple
                value={filterPersonalities}
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

            {/* Availability feedback */}
            {enabled && hasActiveFilters && (
              <Box sx={{ mt: 2 }}>
                {hasEnoughVillagers ? (
                  <Typography variant="body2" color="success.main">
                    {availableCount} villagers available — enough for a {size}x{size} card ({requiredCount} needed).
                  </Typography>
                ) : (
                  <Typography variant="body2" color="error">
                    Only {availableCount} villager{availableCount !== 1 ? 's' : ''} match these filters — a {size}x{size} card needs {requiredCount}. Visitors won&apos;t be able to generate a card with these settings.
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}