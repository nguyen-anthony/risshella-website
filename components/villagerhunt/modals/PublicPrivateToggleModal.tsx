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
  onConfirm: () => void;
  isTogglingToPublic: boolean;
};

export default function PublicPrivateToggleModal({ open, onClose, onConfirm, isTogglingToPublic }: Props) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {isTogglingToPublic ? 'Change visibility to Public?' : 'Change visibility to Private?'}
      </DialogTitle>
      <DialogContent>
        <Typography>
          {isTogglingToPublic 
            ? "By setting this to public, you will be searchable via the home page and your hunt statistics will be included in global statistic calculations. Are you sure you're okay with this?"
            : "By setting this to private, you will be hidden from the home page search and your data will not be used in the global statistics. People can still see your hunt information if they navigate directly to your page. Are you sure you're okay with this?"
          }
        </Typography>
        {!isTogglingToPublic && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Currently there is no true way to make your page private/hidden from others.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          No
        </Button>
        <Button onClick={onConfirm} variant="contained" color="primary">
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
