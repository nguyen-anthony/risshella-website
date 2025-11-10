import * as React from "react";
import Link from "next/link";
import { Card, CardActionArea, CardContent, CardHeader, Avatar, Typography } from "@mui/material";
import type { Creator } from "@/types/creator";

type Props = {
  creator: Creator;
  statusText?: string;
  isModerated?: boolean;
};

export default function CreatorCard({ creator, statusText = "Villager hunt in progress", isModerated = false }: Props) {
  const { twitch_username, display_name, avatar_url } = creator;

  return (
    <Card elevation={3} sx={{ height: "100%", ...(isModerated && { backgroundColor: 'rgba(147, 112, 219, 0.1)' }) }}>
      {/* Reserve ActionArea for future clickability */}
      <CardActionArea
        component={Link}
        href={`/villagerhunt/${encodeURIComponent(twitch_username)}`}
        sx={{ height: "100%", alignItems: "stretch" }}
      >
        <CardHeader
          avatar={<Avatar src={avatar_url ?? undefined} alt={display_name || twitch_username} />}
          title={
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              {display_name || twitch_username}
            </Typography>
          }
          sx={{ pb: 0.5 }}
        />
        <CardContent sx={{ pt: 0.5 }}>
          {/* Placeholder for extra details later (game, island, status, etc.) */}
          <Typography variant="body2" color="text.secondary">
            {statusText}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
