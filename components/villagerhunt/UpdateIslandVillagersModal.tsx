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
import VillagerAutocomplete from "./VillagerAutocomplete";

type Props = {
  open: boolean;
  onClose: () => void;
  huntId: string;
  currentIslandVillagers: number[];
  currentHotelTourists: number[];
  villagers: Villager[];
  onUpdated?: () => void;
};

export default function UpdateIslandVillagersModal({
  open,
  onClose,
  huntId,
  currentIslandVillagers,
  currentHotelTourists,
  villagers,
  onUpdated
}: Props) {
  const [selectedVillagers, setSelectedVillagers] = React.useState<Villager[]>([]);
  const [selectedHotelTourists, setSelectedHotelTourists] = React.useState<Villager[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  // Initialize selected villagers when modal opens
  React.useEffect(() => {
    if (open) {
      const current = villagers.filter(v => currentIslandVillagers.includes(v.villager_id));
      setSelectedVillagers(current);
      const currentTourists = villagers.filter(v => currentHotelTourists.includes(v.villager_id));
      setSelectedHotelTourists(currentTourists);
    }
  }, [open, currentIslandVillagers, currentHotelTourists, villagers]);

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/hunts/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hunt_id: huntId,
          island_villagers: selectedVillagers.map(v => v.villager_id),
          hotel_tourists: selectedHotelTourists.map(v => v.villager_id)
        }),
      });

      if (res.ok) {
        onUpdated?.();
        onClose();
      } else {
        alert('Failed to update island villagers. Please try again.');
      }
    } catch (error) {
      console.error('Error updating island villagers:', error);
      alert('Failed to update island villagers. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Update Island Villagers and Hotel Tourists</DialogTitle>
      <DialogContent sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="body2" component="h1">
            Villagers in this list will not be included on generated Bingo cards for your community.
        </Typography>
        <VillagerAutocomplete
          multiple
          villagers={villagers}
          value={selectedVillagers}
          onChange={(v) => {
            const newValue = v as Villager[];
            setSelectedVillagers(newValue.slice(0, 9));
          }}
          label="Island Villagers (max 9)"
          helperText="Select villagers currently on your island"
          maxSelection={9}
          excludeVillagerIds={selectedHotelTourists.map(h => h.villager_id)}
        />
        <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
          {selectedVillagers.length}/9 villagers selected
        </Box>
        <VillagerAutocomplete
          multiple
          villagers={villagers}
          value={selectedHotelTourists}
          onChange={(v) => {
            const newValue = v as Villager[];
            setSelectedHotelTourists(newValue.slice(0, 9));
          }}
          label="Current Hotel Tourists (max 9)"
          helperText="Select villagers currently visiting as hotel tourists"
          maxSelection={9}
          excludeVillagerIds={selectedVillagers.map(s => s.villager_id)}
        />
        <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
          {selectedHotelTourists.length}/9 tourists selected
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleUpdate}
          variant="contained"
          disabled={submitting}
        >
          {submitting ? "Updating..." : "Update Island Villagers and Tourists"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}