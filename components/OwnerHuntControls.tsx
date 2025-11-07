"use client";
import * as React from "react";
import { Box, Button } from "@mui/material";
import StartHuntModal from "@/components/StartHuntModal";

type Props = {
  showStart?: boolean;
};

export default function OwnerHuntControls({ showStart = false }: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {showStart && (
          <Button variant="contained" onClick={() => setOpen(true)}>Start New Hunt</Button>
        )}
      </Box>
      <StartHuntModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
