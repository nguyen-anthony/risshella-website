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

type Villager = { villager_id: number; name: string; image_url: string | null };

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export default function StartHuntModal({ open, onClose, onCreated }: Props) {
  const [villagers, setVillagers] = React.useState<Villager[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [huntName, setHuntName] = React.useState("");
  const [selected, setSelected] = React.useState<Villager | null>(null);
  const [islandVillagers, setIslandVillagers] = React.useState<Villager[]>([]);
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
    if (!selected) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/hunts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hunt_name: huntName || undefined,
          target_villager_id: selected.villager_id,
          island_villagers: islandVillagers.map(v => v.villager_id)
        }),
      });
      if (res.ok) {
        onCreated?.();
        onClose();
      } else {
        // Handle error
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
        />
        <Autocomplete
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
          renderInput={(params) => <TextField {...params} label="Target Villager" required />}
        />
        <Autocomplete
          multiple
          loading={loading}
          options={villagers.filter(v => !selected || v.villager_id !== selected.villager_id)}
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
          renderInput={(params) => <TextField {...params} label="Island Villagers (max 9)" helperText="Select villagers currently on your island" />}
          renderTags={(tagValue) =>
            tagValue.map((option) => (
              <Box key={option.villager_id} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Avatar src={option.image_url ?? undefined} alt={option.name} sx={{ width: 20, height: 20 }} />
                {option.name}
              </Box>
            ))
          }
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleCreate} variant="contained" disabled={!selected || submitting}>
          {submitting ? "Creating..." : "Create Hunt"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
