"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
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
  Typography,
} from "@mui/material";

type Villager = { villager_id: number; name: string; image_url: string | null };

import type { EncounterRow } from "@/components/villagerhunt/EncountersTable";

type Props = {
  open: boolean;
  onClose: () => void;
  huntId: string;
  encounters: EncounterRow[];
};

export default function AddEncounterModal({ open, onClose, huntId, encounters }: Props) {
  const router = useRouter();
  const [villagers, setVillagers] = React.useState<Villager[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [islandNumber, setIslandNumber] = React.useState("");
  const [selected, setSelected] = React.useState<Villager | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const villagerInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      const maxIsland = encounters.length > 0 ? Math.max(...encounters.map(e => e.island_number)) : 0;
      setIslandNumber((maxIsland + 1).toString());
      setSelected(null);
      setError(null); // Clear error when modal opens
      
      // Focus the villager input after a short delay to ensure the modal is fully rendered
      setTimeout(() => {
        villagerInputRef.current?.focus();
      }, 100);
    }
  }, [open, encounters]);

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
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

  const handleAdd = async () => {
    if (!selected || !islandNumber) return;
    setSubmitting(true);
    setError(null); // Clear any previous error
    try {
      const res = await fetch("/api/encounters/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hunt_id: huntId,
          island_number: parseInt(islandNumber),
          villager_id: selected.villager_id
        }),
      });
      if (res.ok) {
        onClose();
        router.replace(window.location.pathname);
      } else {
        // Try to get error message from response
        try {
          const errorData = await res.json();
          setError(errorData.error || 'Failed to add encounter');
        } catch {
          setError('Failed to add encounter');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Encounter</DialogTitle>
      <DialogContent sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        {error && (
          <Typography variant="body2" color="error" sx={{ mb: 1 }}>
            {error}
          </Typography>
        )}
        <TextField
          label="Island Number"
          type="number"
          fullWidth
          value={islandNumber}
          onChange={(e) => setIslandNumber(e.target.value)}
          required
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
              <Avatar src={`/villagers/${option.name.toLowerCase().replace(/[^a-zA-Z0-9\u00C0-\u017F]/g, '_')}.png`} alt={option.name} sx={{ width: 24, height: 24 }} />
              {option.name}
            </Box>
          )}
          renderInput={(params) => <TextField {...params} inputRef={villagerInputRef} label="Villager" required />}
          
        />
        {loading && (
          <Typography variant="caption" color="text.secondary">
            Loading villagers list...
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAdd} variant="contained" disabled={!selected || !islandNumber || submitting}>
          {submitting ? "Adding..." : "Add Encounter"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}