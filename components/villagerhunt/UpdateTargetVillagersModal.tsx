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
        <Autocomplete
          multiple
          options={villagers}
          getOptionKey={(option) => option.villager_id}
          getOptionLabel={(v) => v.name}
          value={selectedVillagers}
          onChange={(_, v) => setSelectedVillagers(v)}
          renderOption={(props, option) => (
            <Box component="li" {...props} key={option.villager_id} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar src={option.image_url ?? undefined} alt={option.name} sx={{ width: 24, height: 24 }} />
              {option.name}
            </Box>
          )}
          renderInput={(params) => <TextField {...params} label="Dreamies" helperText="Select villagers you want to hunt for" />}
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