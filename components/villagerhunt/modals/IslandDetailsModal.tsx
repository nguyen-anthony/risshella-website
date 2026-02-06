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
import VillagerDisplay from "@/components/villagerhunt/displays/VillagerDisplay";
import type { Villager } from "@/types/villagerhunt";

type Props = {
  open: boolean;
  onClose: () => void;
  islandVillagers: Villager[];
  hotelTourists: Villager[];
};

export default function IslandDetailsModal({ open, onClose, islandVillagers, hotelTourists }: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Island Details</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {islandVillagers.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3 }}>
            <Typography variant="h6" color="text.secondary">Current Island Villagers:</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {islandVillagers.map((villager) => (
                <VillagerDisplay key={villager.villager_id} villager={villager} variant="image" />
              ))}
            </Box>
          </Box>
        )}
        {hotelTourists.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="h6" color="text.secondary">Current Hotel Tourists:</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {hotelTourists.map((villager) => (
                <VillagerDisplay key={villager.villager_id} villager={villager} variant="image" />
              ))}
            </Box>
          </Box>
        )}
        {islandVillagers.length === 0 && hotelTourists.length === 0 && (
          <Typography variant="body1" color="text.secondary">
            No island villagers or hotel tourists currently set.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
