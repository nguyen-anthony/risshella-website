"use client";
import * as React from "react";
import { 
  Autocomplete, 
  Avatar, 
  Box, 
  Button,
  Collapse,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography 
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import type { Villager } from "@/types/villagerhunt";
import { VILLAGER_PERSONALITIES, VILLAGER_SPECIES, VILLAGER_SIGNS } from "@/constants/villagers";

type Props = {
  villagers: Villager[];
  value: Villager | Villager[] | null;
  onChange: (value: Villager | Villager[] | null) => void;
  label?: string;
  multiple?: boolean;
  loading?: boolean;
  required?: boolean;
  helperText?: string;
  disabled?: boolean;
  maxSelection?: number;
  excludeVillagerIds?: number[];
  showTagAvatars?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

export default function VillagerAutocomplete({
  villagers,
  value,
  onChange,
  label = "Villager",
  multiple = false,
  loading = false,
  required = false,
  helperText,
  disabled = false,
  maxSelection,
  excludeVillagerIds = [],
  showTagAvatars = false,
  inputRef,
  onKeyDown,
}: Props) {
  const [showFilters, setShowFilters] = React.useState(false);
  const [speciesFilter, setSpeciesFilter] = React.useState<string>("");
  const [personalityFilter, setPersonalityFilter] = React.useState<string>("");
  const [signFilter, setSignFilter] = React.useState<string>("");

  // Apply filters
  const filteredVillagers = React.useMemo(() => {
    let filtered = excludeVillagerIds.length > 0
      ? villagers.filter(v => !excludeVillagerIds.includes(v.villager_id))
      : villagers;

    if (speciesFilter) {
      filtered = filtered.filter(v => v.species === speciesFilter);
    }
    if (personalityFilter) {
      filtered = filtered.filter(v => v.personality === personalityFilter);
    }
    if (signFilter) {
      filtered = filtered.filter(v => v.sign === signFilter);
    }

    return filtered;
  }, [villagers, excludeVillagerIds, speciesFilter, personalityFilter, signFilter]);

  const activeFiltersCount = [speciesFilter, personalityFilter, signFilter].filter(Boolean).length;

  const handleClearFilters = () => {
    setSpeciesFilter("");
    setPersonalityFilter("");
    setSignFilter("");
  };

  const handleChange = (_: unknown, newValue: Villager | Villager[] | null) => {
    if (multiple && Array.isArray(newValue) && maxSelection && newValue.length > maxSelection) {
      onChange(newValue.slice(0, maxSelection));
    } else {
      onChange(newValue);
    }
  };

  return (
    <Box>
      {/* Filter Toggle Button */}
      <Box sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
        <Button
          size="small"
          startIcon={<FilterListIcon />}
          endIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          onClick={() => setShowFilters(!showFilters)}
          variant="outlined"
        >
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </Button>
        {activeFiltersCount > 0 && (
          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={handleClearFilters}
            variant="text"
          >
            Clear All
          </Button>
        )}
      </Box>

      {/* Filter Controls */}
      <Collapse in={showFilters}>
        <Stack spacing={2} sx={{ mb: 2, p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Filter villagers by characteristics:
          </Typography>
          
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Species</InputLabel>
              <Select
                value={speciesFilter}
                label="Species"
                onChange={(e) => setSpeciesFilter(e.target.value)}
              >
                <MenuItem value="">
                  <em>All Species</em>
                </MenuItem>
                {VILLAGER_SPECIES.map(species => (
                  <MenuItem key={species} value={species}>{species}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Personality</InputLabel>
              <Select
                value={personalityFilter}
                label="Personality"
                onChange={(e) => setPersonalityFilter(e.target.value)}
              >
                <MenuItem value="">
                  <em>All Personalities</em>
                </MenuItem>
                {VILLAGER_PERSONALITIES.map(personality => (
                  <MenuItem key={personality} value={personality}>{personality}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Sign</InputLabel>
              <Select
                value={signFilter}
                label="Sign"
                onChange={(e) => setSignFilter(e.target.value)}
              >
                <MenuItem value="">
                  <em>All Signs</em>
                </MenuItem>
                {VILLAGER_SIGNS.map(sign => (
                  <MenuItem key={sign} value={sign}>{sign}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {activeFiltersCount > 0 && (
            <Typography variant="caption" color="text.secondary">
              Showing {filteredVillagers.length} of {villagers.length} villagers
            </Typography>
          )}
        </Stack>
      </Collapse>

      {/* Autocomplete */}
      <Autocomplete
      multiple={multiple}
      loading={loading}
      disabled={disabled}
      options={filteredVillagers}
      getOptionKey={(option: Villager) => option.villager_id}
      getOptionLabel={(v: Villager) => v.name}
      value={value}
      onChange={handleChange}
      isOptionEqualToValue={(option: Villager, value: Villager) => option.villager_id === value.villager_id}
      renderOption={(props, option: Villager) => (
        <Box
          component="li"
          {...props}
          key={option.villager_id}
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <Avatar
            src={option.image_url ?? undefined}
            alt={option.name}
            sx={{ width: 24, height: 24 }}
          />
          {option.name}
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          inputRef={inputRef}
          inputProps={{
            ...params.inputProps,
            onKeyDown: onKeyDown,
          }}
          required={required}
          helperText={helperText}
        />
      )}
      {...(showTagAvatars && multiple && {
        renderTags: (tagValue: Villager[]) =>
          tagValue.map((option: Villager) => (
            <Box
              key={option.villager_id}
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <Avatar
                src={`/villagers/${option.name.toLowerCase().replace(/[^a-zA-Z0-9\u00C0-\u017F-]/g, '_')}.png`}
                alt={option.name}
                sx={{ width: 20, height: 20 }}
              />
              {option.name}
            </Box>
          )),
      })}
    />
    </Box>
  );
}
