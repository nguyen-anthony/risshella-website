"use client";
import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
} from "@mui/material";

interface InfoDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function InfoDialog({ open, onClose }: InfoDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 700 }}>
        Welcome to Animal Crossing Villager Hunt!
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              What is this?
            </Typography>
            <Typography variant="body1">
              This is a villager hunting tracker for Animal Crossing: New Horizons.
              Streamers and players can track their progress in finding specific villagers (their &quot;dreamies&quot;)
              and share their hunts with their community.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              Why was it made?
            </Typography>
            <Typography variant="body1">
              I (Ront) created this as a tool to help my wife (Risshella) with her villager hunting history
              that allows her community to interact with the data via Villager Hunt Bingo.
              This now can be expanded for others to use with simple Twitch authentication.

              Why Twitch authentication? Because it was for the purpose of helping a Twitch stream.
              Will I implement other authentication types? Probably not, but I&apos;m not against it
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              How to use:
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2" component="div">
                <strong>For Streamers/Creators:</strong>
              </Typography>
              <Typography variant="body2" component="div" sx={{ pl: 2 }}>
                • Login with Twitch to create your own hunt<br/>
                • Select your dreamie villagers (the ones you&apos;re hunting for)<br/>
                • Optionally exclude villagers already on your island<br/>
                • Generate bingo cards for your community to play along<br/>
                • Track encounters and progress in real-time
              </Typography>

              <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                <strong>For Viewers:</strong>
              </Typography>
              <Typography variant="body2" component="div" sx={{ pl: 2 }}>
                • Browse active hunts from your favorite streamers<br/>
                • View encounter logs and progress<br/>
                • Download bingo cards to play along<br/>
                • Stay updated on hunting progress
              </Typography>
            </Stack>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Pro tip: Bingo cards automatically exclude your dreamies and island villagers to keep the game fair and fun!
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              How to report issues/request features?
            </Typography>
            <Typography variant="body2" component="div" sx={{ pl: 2 }}>
                TBD
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" fullWidth>
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );
}