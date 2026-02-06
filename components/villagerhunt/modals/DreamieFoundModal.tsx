"use client";
import * as React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

type Props = {
  open: boolean;
  onClose: () => void;
  huntId: string;
  onComplete: () => void;
};

export default function DreamieFoundModal({ open, onClose, huntId, onComplete }: Props) {
  const handleClose = () => {
    localStorage.setItem(`dreamiePopupShown_${huntId}`, "true");
    onClose();
  };

  const handleComplete = () => {
    onComplete();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Looks like you found a dreamie!</DialogTitle>
      <DialogContent>
        <Typography>Would you like to mark this hunt as Complete?</Typography>
        <Typography>You can complete this later in the settings/gear icon.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Not Now</Button>
        <Button variant="contained" color="success" onClick={handleComplete}>
          Complete Hunt
        </Button>
      </DialogActions>
    </Dialog>
  );
}
