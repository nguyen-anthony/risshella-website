import * as React from "react";
import { Card, CardActionArea, CardContent, CardHeader, Avatar, Typography } from "@mui/material";
import type { Creator } from "@/types/creator";

type Props = {
  creator: Creator;
};

export default function CreatorCard({ creator }: Props) {
  const { twitch_username, avatar_url } = creator;

  return (
    <Card elevation={3} sx={{ height: "100%" }}>
      {/* Reserve ActionArea for future clickability */}
      <CardActionArea sx={{ height: "100%", alignItems: "stretch" }}>
        <CardHeader
          avatar={<Avatar src={avatar_url ?? undefined} alt={twitch_username} />}
          title={
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              {twitch_username}
            </Typography>
          }
          sx={{ pb: 0.5 }}
        />
        <CardContent sx={{ pt: 0.5 }}>
          {/* Placeholder for extra details later (game, island, status, etc.) */}
          <Typography variant="body2" color="text.secondary">
            TODO: Add hunt name, last time played.
            Maybe even a LIVE NOW
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
