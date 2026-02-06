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
  Tooltip,
  Typography,
} from "@mui/material";
import type { Hunt } from "@/types/villagerhunt";

type Props = {
  open: boolean;
  onClose: () => void;
  hunt: Hunt | null;
  isOwner: boolean;
  isModerator: boolean;
  isTempMod: boolean;
  overlayUrl: string;
  onUpdateTargetOpen: () => void;
  onUpdateIslandOpen: () => void;
  onBingoSettingsOpen: () => void;
  onTempModsOpen: () => void;
  onDeleteOpen: () => void;
};

export default function HuntSettingsModal({
  open,
  onClose,
  hunt,
  isOwner,
  isModerator,
  isTempMod,
  overlayUrl,
  onUpdateTargetOpen,
  onUpdateIslandOpen,
  onBingoSettingsOpen,
  onTempModsOpen,
  onDeleteOpen,
}: Props) {
  const handleComplete = () => {
    if (!hunt) return;
    const form = document.createElement("form");
    form.method = "post";
    form.action = "/api/hunts/complete";
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "hunt_id";
    input.value = hunt.hunt_id;
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
  };

  const handlePause = () => {
    if (!hunt) return;
    const form = document.createElement("form");
    form.method = "post";
    form.action = "/api/hunts/pause";
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "hunt_id";
    input.value = hunt.hunt_id;
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
  };

  const handleAbandon = () => {
    if (!hunt) return;
    const form = document.createElement("form");
    form.method = "post";
    form.action = "/api/hunts/abandon";
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "hunt_id";
    input.value = hunt.hunt_id;
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <Dialog open={open} onClose={onClose} sx={{ "& .MuiDialog-paper": { minWidth: "300px" } }}>
      <DialogTitle>Hunt Settings</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {hunt && (
            <>
              {(isOwner || isModerator || isTempMod) && (
                <>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      onUpdateTargetOpen();
                      onClose();
                    }}
                  >
                    Update Dreamies
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      onUpdateIslandOpen();
                      onClose();
                    }}
                  >
                    Update Island Villagers/Tourists
                  </Button>
                  <Button variant="outlined" onClick={onBingoSettingsOpen}>
                    Bingo Settings
                  </Button>
                </>
              )}
              {isOwner && (
                <>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      onTempModsOpen();
                      onClose();
                    }}
                  >
                    Temp Mods
                  </Button>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Typography variant="subtitle1">Update Hunt Status</Typography>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        flexWrap: "wrap",
                        flexDirection: { xs: "column", sm: "row" },
                      }}
                    >
                      <Tooltip title="Marks as completed and saves to history. Cannot be resumed.">
                        <Button variant="contained" color="success" onClick={handleComplete}>
                          Complete Hunt
                        </Button>
                      </Tooltip>
                      <Tooltip title="Marks as paused and can be resumed from hunt history">
                        <Button variant="contained" color="warning" onClick={handlePause}>
                          Pause Hunt
                        </Button>
                      </Tooltip>
                      <Tooltip title="Marks as abandoned and saves to history. Cannot be resumed. Quitter">
                        <Button variant="contained" color="error" onClick={handleAbandon}>
                          Abandon Hunt
                        </Button>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Button
                    variant="contained"
                    color="error"
                    size="large"
                    onClick={() => {
                      onDeleteOpen();
                      onClose();
                    }}
                    sx={{ fontWeight: "bold" }}
                  >
                    Delete Hunt
                  </Button>
                  <TextField
                    disabled
                    fullWidth
                    value={overlayUrl}
                    helperText="Overlay: Set this URL as a browser source in OBS"
                  />
                </>
              )}
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
