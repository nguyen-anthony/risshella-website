import * as React from "react";
import Grid from "@mui/material/Grid2";
import { Box, Typography } from "@mui/material";
import CreatorCard from "@/components/villagerhunt/CreatorCard";
import type { Creator } from "@/types/creator";

type Props = {
  creators: Creator[];
  emptyMessage?: string;
  moderatedUsernames?: string[];
  activeHunts: { hunt_id: string; hunt_name: string; twitch_id: number }[];
};


export default function CreatorsGrid({ creators, emptyMessage = "No creators found.", moderatedUsernames = [], activeHunts }: Props) {  if (!creators?.length) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      {creators.map((c) => {
        const isModerated = moderatedUsernames.includes(c.twitch_username.toLowerCase());
        const activeHunt = activeHunts.find(h => h.twitch_id === c.twitch_id);
        const statusText = isModerated ? "You moderate this channel!" : (activeHunt ? activeHunt.hunt_name : "No hunt in progress.");
        return (
          <Grid key={c.twitch_id} size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 2 }}>
            <CreatorCard creator={c} statusText={statusText} isModerated={isModerated} />
          </Grid>
        );
      })}
    </Grid>
  );
}
