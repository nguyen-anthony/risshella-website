import * as React from "react";
import Link from "next/link";
import { Card, CardActionArea, CardContent, CardHeader, Avatar, Typography, Box } from "@mui/material";
import Image from "next/image";
import type { Creator } from "@/types/creator";

type Props = {
  creator: Creator;
  statusText?: string;
  isModerated?: boolean;
  currentIsland?: number;
};

export default function CreatorCard({ creator, statusText = "Villager hunt in progress", isModerated = false, currentIsland }: Props) {
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
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            {statusText}
          </Typography>
          {currentIsland && (
            <Box sx={{ position: 'relative', width: 80, height: 80, mx: 'auto' }}>
              <Image src="/island_image.png" alt="Island" fill style={{ objectFit: 'cover' }} />
              <Typography
                variant="h5"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'white',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                  fontWeight: 'bold',
                }}
              >
                {currentIsland}
              </Typography>
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
