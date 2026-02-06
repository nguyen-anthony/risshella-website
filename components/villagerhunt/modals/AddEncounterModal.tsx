"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import type { Villager } from "@/types/villagerhunt";
import VillagerAutocomplete from "@/components/villagerhunt/inputs/VillagerAutocomplete";
import { useVillagers } from "@/components/villagerhunt/hooks";

import type { EncounterRow } from "@/components/villagerhunt/tables/EncountersTable";

type Props = {
  open: boolean;
  onClose: () => void;
  huntId: string;
  encounters: EncounterRow[];
};

export default function AddEncounterModal({ open, onClose, huntId, encounters }: Props) {
  const router = useRouter();
  const { villagers, loading } = useVillagers();
  const [islandNumber, setIslandNumber] = React.useState("");
  const [selected, setSelected] = React.useState<Villager | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && selected && islandNumber) {
      handleAdd();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const inputValue = e.currentTarget.value.toLowerCase();
      const filtered = villagers.filter(v => v.name.toLowerCase().includes(inputValue));
      if (filtered.length > 0) {
        setSelected(filtered[0]);
      }
    }
  };
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
      } else if (res.status === 401) {
        // Token expired or authentication issue - silently redirect to re-authenticate
        window.location.href = `/api/auth/twitch?return=${encodeURIComponent(window.location.pathname)}`;
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
        <VillagerAutocomplete
          villagers={villagers}
          loading={loading}
          value={selected}
          onChange={(v) => setSelected(Array.isArray(v) ? v[0] || null : v)}
          inputRef={villagerInputRef}
          onKeyDown={handleKeyDown}
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