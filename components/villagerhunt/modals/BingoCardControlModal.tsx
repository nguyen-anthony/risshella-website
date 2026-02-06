"use client";
import * as React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from "@mui/material";

type Props = {
  open: boolean;
  onClose: () => void;
  isBingoEnabled: boolean;
  bingoCardSize: number;
  onSave: (isEnabled: boolean, size: number) => void;
};

export default function BingoCardControlModal({
  open,
  onClose,
  isBingoEnabled,
  bingoCardSize,
  onSave,
}: Props) {
  const [enabled, setEnabled] = React.useState(isBingoEnabled);
  const [size, setSize] = React.useState(bingoCardSize);

  React.useEffect(() => {
    setEnabled(isBingoEnabled);
    setSize(bingoCardSize);
  }, [isBingoEnabled, bingoCardSize]);

  const handleSave = () => {
    onSave(enabled, size);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} sx={{ '& .MuiDialog-paper': { minWidth: '400px' } }}>
      <DialogTitle>Bingo Card Settings</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
            }
            label="Enable Bingo Card Generation"
          />
          <FormControl fullWidth>
            <InputLabel>Bingo Card Size</InputLabel>
            <Select
              value={size}
              label="Bingo Card Size"
              onChange={(e) => setSize(Number(e.target.value))}
              disabled={!enabled}
            >
              <MenuItem value={3}>3x3</MenuItem>
              <MenuItem value={4}>4x4</MenuItem>
              <MenuItem value={5}>5x5</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}