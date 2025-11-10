"use client";
import * as React from "react";
import { Box, Button } from "@mui/material";
import AddEncounterModal from "@/components/AddEncounterModal";

import type { EncounterRow } from "@/components/EncountersTable";

type Props = {
  huntId: string;
  isOwner: boolean;
  isModerator: boolean;
  encounters: EncounterRow[];
};

export default function EncounterControls({ huntId, isOwner, isModerator, encounters }: Props) {
  const [addOpen, setAddOpen] = React.useState(false);

  if (!isOwner && !isModerator) return null;

  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Button variant="outlined" onClick={() => setAddOpen(true)}>Add New Encounter</Button>
        <Button variant="outlined">Update Encounter</Button>
        <Button variant="outlined">Delete Encounter</Button>
      </Box>
      <AddEncounterModal open={addOpen} onClose={() => setAddOpen(false)} huntId={huntId} encounters={encounters} />
    </>
  );
}