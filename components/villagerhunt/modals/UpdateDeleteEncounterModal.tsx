"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import type { Villager } from "@/types/vilagerhunt";
import VillagerAutocomplete from "@/components/villagerhunt/inputs/VillagerAutocomplete";

import type { EncounterRow } from "@/components/villagerhunt/tables/EncountersTable";

type Props = {
  open: boolean;
  onClose: () => void;
  encounter: EncounterRow | null;
  villagers: Villager[];
};

export default function UpdateDeleteEncounterModal({ open, onClose, encounter, villagers }: Props) {
  const router = useRouter();
  const [islandNumber, setIslandNumber] = React.useState("");
  const [selected, setSelected] = React.useState<Villager | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open && encounter) {
      setIslandNumber(encounter.island_number.toString());
      const villager = villagers.find(v => v.villager_id === encounter.villager_id) || null;
      setSelected(villager);
    }
  }, [open, encounter, villagers]);

  const handleUpdate = async () => {
    if (!selected || !islandNumber || !encounter) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/encounters/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          encounter_id: encounter.encounter_id,
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
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!encounter) return;
    const villagerName = selected?.name || "Unknown";
    const confirmed = window.confirm(`Are you sure you want to delete this encounter?\n\nIsland: ${islandNumber}\nVillager: ${villagerName}`);
    if (!confirmed) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/encounters/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          encounter_id: encounter.encounter_id
        }),
      });
      if (res.ok) {
        onClose();
        router.replace(window.location.pathname);
      } else if (res.status === 401) {
        // Token expired or authentication issue - silently redirect to re-authenticate
        window.location.href = `/api/auth/twitch?return=${encodeURIComponent(window.location.pathname)}`;
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!encounter) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Update/Delete Encounter</DialogTitle>
      <DialogContent sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
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
          value={selected}
          onChange={(v) => setSelected(v as Villager | null)}
          label="Villager"
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleDelete} variant="outlined" color="error" disabled={submitting}>
          Delete
        </Button>
        <Button onClick={handleUpdate} variant="contained" disabled={!selected || !islandNumber || submitting}>
          {submitting ? "Updating..." : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}