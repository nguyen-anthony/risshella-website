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
  Typography,
} from "@mui/material";

type Villager = { villager_id: number; name: string; image_url: string | null };

type Props = {
  open: boolean;
  onClose: () => void;
  huntId: string;
  currentIslandVillagers: number[];
  villagers: Villager[];
  onUpdated?: () => void;
};

export default function UpdateIslandVillagersModal({
  open,
  onClose,
  huntId,
  currentIslandVillagers,
  villagers,
  onUpdated
}: Props) {
  const [selectedVillagers, setSelectedVillagers] = React.useState<Villager[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  // Initialize selected villagers when modal opens
  React.useEffect(() => {
    if (open) {
      const current = villagers.filter(v => currentIslandVillagers.includes(v.villager_id));
      setSelectedVillagers(current);
    }
  }, [open, currentIslandVillagers, villagers]);

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/hunts/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hunt_id: huntId,
          island_villagers: selectedVillagers.map(v => v.villager_id)
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
      <DialogTitle>Update Island Villagers</DialogTitle>
      <DialogContent sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="body2" component="h1">
            Villagers in this list will not be included on generated Bingo cards for your community.
        </Typography>
        <Autocomplete
          multiple
          options={villagers}
          getOptionKey={(option) => option.villager_id}
          getOptionLabel={(v) => v.name}
          value={selectedVillagers}
          onChange={(_, v) => setSelectedVillagers(v.slice(0, 9))} // Limit to 9 villagers
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
        <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
          {selectedVillagers.length}/9 villagers selected
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleUpdate}
          variant="contained"
          disabled={submitting}
        >
          {submitting ? "Updating..." : "Update Island Villagers"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}