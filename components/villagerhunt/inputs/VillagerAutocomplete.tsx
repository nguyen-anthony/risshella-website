"use client";
import * as React from "react";
import { Autocomplete, Avatar, Box, TextField } from "@mui/material";
import type { Villager } from "@/types/villagerhunt";

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
  const filteredVillagers = excludeVillagerIds.length > 0
    ? villagers.filter(v => !excludeVillagerIds.includes(v.villager_id))
    : villagers;

  const handleChange = (_: unknown, newValue: Villager | Villager[] | null) => {
    if (multiple && Array.isArray(newValue) && maxSelection && newValue.length > maxSelection) {
      onChange(newValue.slice(0, maxSelection));
    } else {
      onChange(newValue);
    }
  };

  return (
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
  );
}
