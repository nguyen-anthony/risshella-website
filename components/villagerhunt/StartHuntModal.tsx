"use client";
import * as React from "react";
import {
  Avatar,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import BingoCardControlModal from "./BingoCardControlModal";
import { createClient } from "@/utils/supabase/client";
import type { Villager } from "@/types/villagerhunt";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export default function StartHuntModal({ open, onClose, onCreated }: Props) {
  const [villagers, setVillagers] = React.useState<Villager[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [huntName, setHuntName] = React.useState("");
  const [selected, setSelected] = React.useState<Villager[]>([]);
  const [islandVillagers, setIslandVillagers] = React.useState<Villager[]>([]);
  const [hotelTourists, setHotelTourists] = React.useState<Villager[]>([]);
  const [isBingoEnabled, setIsBingoEnabled] = React.useState(true);
  const [bingoCardSize, setBingoCardSize] = React.useState(5);
  const [bingoSettingsModalOpen, setBingoSettingsModalOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        // Bust any client-side stale list by preventing HTTP caching; rely on in-memory state only.
        const res = await fetch("/api/villagers/index", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setVillagers(json.villagers as Villager[]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open]);

  const handleCreate = async () => {
    if (!selected.length) return;
    setSubmitting(true);
    try {
      // Double-check for active hunts before creating (using same pattern as HuntPageWrapper)
      const supabase = createClient();
      const { data: existingActiveHunt } = await supabase
        .from('hunts')
        .select('hunt_id')
        .eq('hunt_status', 'ACTIVE')
        .maybeSingle();
      
      if (existingActiveHunt) {
        alert("An active hunt already exists. Refreshing the page to load it...");
        window.location.reload();
        return;
      }

      const res = await fetch("/api/hunts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hunt_name: huntName || undefined,
          target_villager_id: selected.map(v => v.villager_id),
          island_villagers: islandVillagers.map(v => v.villager_id),
          hotel_tourists: hotelTourists.map(v => v.villager_id),
          is_bingo_enabled: isBingoEnabled,
          bingo_card_size: bingoCardSize,
        }),
      });
      if (res.ok) {
        onCreated?.();
        onClose();
      } else if (res.status === 409) {
        // Server-side duplicate check caught it - refresh to load existing hunt
        window.location.reload();
      } else {
        alert("Failed to create hunt. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Start a New Hunt</DialogTitle>
      <DialogContent sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Hunt Name (optional)"
          fullWidth
          value={huntName}
          onChange={(e) => setHuntName(e.target.value)}
          helperText="Default hunt name will be 'Hunt for {dreamie villagers}'"
        />
        <Autocomplete
          multiple
          loading={loading}
          options={villagers}
          getOptionKey={(option) => option.villager_id}
          getOptionLabel={(v) => v.name}
          value={selected}
          onChange={(_, v) => setSelected(v)}
          renderOption={(props, option) => (
            <Box component="li" {...props} key={option.villager_id} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar src={option.image_url ?? undefined} alt={option.name} sx={{ width: 24, height: 24 }} />
              {option.name}
            </Box>
          )}
          renderInput={(params) => <TextField {...params} label="Dreamie List" required helperText="Select the villagers you're hunting for"/>}
          renderTags={(tagValue) =>
            tagValue.map((option) => (
              <Box key={option.villager_id} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Avatar src={`/villagers/${option.name.toLowerCase().replace(/[^a-zA-Z0-9\u00C0-\u017F-]/g, '_')}.png`} alt={option.name} sx={{ width: 20, height: 20 }} />
                {option.name}
              </Box>
            ))
          }
        />
        <Autocomplete
          multiple
          loading={loading}
          options={villagers.filter(v => !selected.some(s => s.villager_id === v.villager_id) && !hotelTourists.some(h => h.villager_id === v.villager_id))}
          getOptionKey={(option) => option.villager_id}
          getOptionLabel={(v) => v.name}
          value={islandVillagers}
          onChange={(_, v) => setIslandVillagers(v.slice(0, 9))} // Limit to 9 villagers
          renderOption={(props, option) => (
            <Box component="li" {...props} key={option.villager_id} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar src={option.image_url ?? undefined} alt={option.name} sx={{ width: 24, height: 24 }} />
              {option.name}
            </Box>
          )}
          renderInput={(params) => <TextField {...params} label="Island Villagers (max 9)" helperText="Select villagers currently on your island. Villagers in this list will not be included on generated Bingo cards for your community. You can edit this later. Why 9? Because you must have an open spot on your island to do a villager hunt." />}
          renderTags={(tagValue) =>
            tagValue.map((option) => (
              <Box key={option.villager_id} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Avatar src={option.image_url ?? undefined} alt={option.name} sx={{ width: 20, height: 20 }} />
                {option.name}
              </Box>
            ))
          }
        />
        <Autocomplete
          multiple
          loading={loading}
          options={villagers.filter(v => !selected.some(s => s.villager_id === v.villager_id) && !islandVillagers.some(i => i.villager_id === v.villager_id))}
          getOptionKey={(option) => option.villager_id}
          getOptionLabel={(v) => v.name}
          value={hotelTourists}
          onChange={(_, v) => setHotelTourists(v.slice(0, 9))} // Limit to 9 tourists
          renderOption={(props, option) => (
            <Box component="li" {...props} key={option.villager_id} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar src={option.image_url ?? undefined} alt={option.name} sx={{ width: 24, height: 24 }} />
              {option.name}
            </Box>
          )}
          renderInput={(params) => <TextField {...params} label="Current Hotel Tourists (max 9)" helperText="Select villagers currently visiting as hotel tourists. These villagers cannot be found during hunts and will be excluded from bingo cards." />}
          renderTags={(tagValue) =>
            tagValue.map((option) => (
              <Box key={option.villager_id} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Avatar src={option.image_url ?? undefined} alt={option.name} sx={{ width: 20, height: 20 }} />
                {option.name}
              </Box>
            ))
          }
        />
        <Button
          variant="outlined"
          onClick={() => setBingoSettingsModalOpen(true)}
          sx={{ alignSelf: 'flex-start' }}
        >
          Bingo Settings
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleCreate} variant="contained" disabled={!selected.length || submitting}>
          {submitting ? "Creating..." : "Create Hunt"}
        </Button>
      </DialogActions>
      <BingoCardControlModal
        open={bingoSettingsModalOpen}
        onClose={() => setBingoSettingsModalOpen(false)}
        isBingoEnabled={isBingoEnabled}
        bingoCardSize={bingoCardSize}
        onSave={(enabled, size) => {
          setIsBingoEnabled(enabled);
          setBingoCardSize(size);
        }}
      />
    </Dialog>
  );
}
