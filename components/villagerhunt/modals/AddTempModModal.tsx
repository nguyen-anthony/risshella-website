"use client";
import * as React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  creatorTwitchId: number;
};

export default function AddTempModModal({ open, onClose, onSuccess, creatorTwitchId }: Props) {
  const [username, setUsername] = React.useState("");
  const [expiryDate, setExpiryDate] = React.useState("");
  const [expiryTime, setExpiryTime] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async () => {
    if (!username.trim() || !expiryDate || !expiryTime) {
      setError("Please fill in all fields");
      return;
    }

    const expiryTimestamp = new Date(`${expiryDate}T${expiryTime}`).toISOString();
    
    if (new Date(expiryTimestamp) <= new Date()) {
      setError("Expiry time must be in the future");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/temp-mods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorTwitchId,
          username: username.trim(),
          expiryTimestamp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add temp mod");
      }

      // Success
      alert("Successfully added temp mod");
      setUsername("");
      setExpiryDate("");
      setExpiryTime("");
      onSuccess();
    } catch (error) {
      console.error("Error adding temp mod:", error);
      setError(error instanceof Error ? error.message : "Failed to add temp mod");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} sx={{ "& .MuiDialog-paper": { minWidth: "400px" } }}>
      <DialogTitle>Add Temp Mod</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Twitch Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            helperText="Enter the Twitch username to add as temporary moderator"
          />
          <TextField
            label="Expiry Date"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Expiry Time"
            type="time"
            value={expiryTime}
            onChange={(e) => setExpiryTime(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          {submitting ? "Adding..." : "Add Temp Mod"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
