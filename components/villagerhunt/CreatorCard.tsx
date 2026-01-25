import * as React from "react";
import Link from "next/link";
import { Card, CardActionArea, CardContent, CardHeader, Avatar, Typography, Box, Chip, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import Image from "next/image";
import type { Creator } from "@/types/creator";
import TvIcon from '@mui/icons-material/Tv';
import MapIcon from '@mui/icons-material/Map';

type Props = {
  creator: Creator;
  statusText?: string;
  isModerated?: boolean;
  currentIsland?: number;
  isLive?: boolean;
  hasActiveHunt?: boolean;
};

export default function CreatorCard({ creator, statusText = "Villager hunt in progress", isModerated = false, currentIsland, isLive = false, hasActiveHunt = false }: Props) {
  const { twitch_username, display_name, avatar_url } = creator;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleCardClick = (event: React.MouseEvent<HTMLElement>) => {
    // Only show menu if both live and has active hunt
    if (isLive && hasActiveHunt) {
      event.preventDefault();
      setAnchorEl(event.currentTarget);
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const cardContent = (
    <>
      <CardHeader
        avatar={<Avatar src={avatar_url ?? undefined} alt={display_name || twitch_username} />}
        title={
          <Typography variant="subtitle1" fontWeight={600} noWrap>
            {display_name || twitch_username}
          </Typography>
        }
        action={
          isLive ? (
            <Chip 
              label="LIVE" 
              color="error" 
              size="small" 
              sx={{ 
                fontWeight: 700,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.7 }
                }
              }} 
            />
          ) : null
        }
        sx={{ pb: 0.5 }}
      />
      <CardContent sx={{ pt: 0.5 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          {statusText}
        </Typography>
        {currentIsland && (
          <Box sx={{ position: 'relative', width: 80, height: 80, mx: 'auto' }}>
            <Image src="/island_image.png" alt="Island" width={80} height={80} style={{ objectFit: 'cover' }} unoptimized />
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
    </>
  );

  return (
    <>
      <Card elevation={3} sx={{ height: "100%", ...(isModerated && { backgroundColor: 'rgba(147, 112, 219, 0.1)' }) }}>
        {isLive && hasActiveHunt ? (
          <CardActionArea
            onClick={handleCardClick}
            sx={{ height: "100%", alignItems: "stretch" }}
          >
            {cardContent}
          </CardActionArea>
        ) : (
          <CardActionArea
            component={Link}
            href={`/villagerhunt/${encodeURIComponent(twitch_username)}`}
            sx={{ height: "100%", alignItems: "stretch" }}
          >
            {cardContent}
          </CardActionArea>
        )}
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <MenuItem 
          component={Link} 
          href={`/villagerhunt/${encodeURIComponent(twitch_username)}`}
          onClick={handleMenuClose}
        >
          <ListItemIcon>
            <MapIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Go to their hunt</ListItemText>
        </MenuItem>
        <MenuItem 
          component="a" 
          href={`https://www.twitch.tv/${twitch_username}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleMenuClose}
        >
          <ListItemIcon>
            <TvIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Open on Twitch</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
