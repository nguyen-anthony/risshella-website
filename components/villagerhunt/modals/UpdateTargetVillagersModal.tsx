"use client";
import * as React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import type { Villager } from "@/types/villagerhunt";
import VillagerAutocomplete from "@/components/villagerhunt/inputs/VillagerAutocomplete";

type Props = {
  open: boolean;
  onClose: () => void;
  huntId: string;
  currentTargetVillagers: number[];
  villagers: Villager[];
  onUpdated?: () => void;
};

export default function UpdateTargetVillagersModal({
  open,
  onClose,
  huntId,
  currentTargetVillagers,
  villagers,
  onUpdated
}: Props) {
  const [selectedVillagers, setSelectedVillagers] = React.useState<Villager[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  // Initialize selected villagers when modal opens
  React.useEffect(() => {
    if (open) {
      const current = villagers.filter(v => currentTargetVillagers.includes(v.villager_id));
      setSelectedVillagers(current);
    }
  }, [open, currentTargetVillagers, villagers]);

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/hunts/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hunt_id: huntId,
          target_villager_id: selectedVillagers.map(v => v.villager_id)
        }),
      });

      if (res.ok) {
        onUpdated?.();
        onClose();
      } else {
        alert('Failed to update dreamies. Please try again.');
      }
    } catch (error) {
      console.error('Error updating dreamies:', error);
      alert('Failed to update dreamies. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Update Dreamies</DialogTitle>
      <DialogContent sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="body2" component="h1">
            Select the villagers you want to hunt for. These will be displayed as your Dreamie List.
        </Typography>
        <VillagerAutocomplete
          multiple
          villagers={villagers}
          value={selectedVillagers}
          onChange={(v) => setSelectedVillagers(v as Villager[])}
          label="Dreamies"
          helperText="Select villagers you want to hunt for"
        />
        <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
          {selectedVillagers.length} villagers selected
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleUpdate}
          variant="contained"
          disabled={submitting}
        >
          {submitting ? "Updating..." : "Update Dreamies"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}