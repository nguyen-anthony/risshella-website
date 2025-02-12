"use client";
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Box,
  IconButton,
} from "@mui/material";
import { SiInstagram, SiX, SiYoutube, SiTwitch, SiBluesky, SiTiktok } from "react-icons/si";

const Navigation: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setTimeout(() => {
      setAnchorEl(null);
    }, 50);
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: "black" }}>
      <Toolbar>
        {/* Left side: Social media icons and title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="h6"
            component="a"
            href="/"
            sx={{ ml: 2, textDecoration: "none", color: "inherit" }}
          >
            Risshella
          </Typography>
          <IconButton
            color="inherit"
            component="a"
            href="https://twitch.tv/Risshella"
            target="_blank"
            rel="noopener noreferrer"
          >
            <SiTwitch size={24} />
          </IconButton>
          <IconButton
            color="inherit"
            component="a"
            href="https://youtube.com/Risshella"
            target="_blank"
            rel="noopener noreferrer"
          >
            <SiYoutube size={24} />
          </IconButton>
          <IconButton
            color="inherit"
            component="a"
            href="https://bsky.app/profile/Risshella"
            target="_blank"
            rel="noopener noreferrer"
          >
            <SiBluesky size={24} />
          </IconButton>
          <IconButton
            color="inherit"
            component="a"
            href="https://instagram.com/Risshella"
            target="_blank"
            rel="noopener noreferrer"
          >
            <SiInstagram size={24} />
          </IconButton>
          <IconButton
            color="inherit"
            component="a"
            href="https://tiktok.com/@Risshella"
            target="_blank"
            rel="noopener noreferrer"
          >
            <SiTiktok size={24} />
          </IconButton>
          <IconButton
            color="inherit"
            component="a"
            href="https://x.com/Risshellala"
            target="_blank"
            rel="noopener noreferrer"
          >
            <SiX size={24} />
          </IconButton>
        </Box>

        {/* Right side: Navigation links */}
        <Box sx={{ display: "flex", gap: 2, marginLeft: "auto" }}>
          <Button color="inherit" href="/">
            Home
          </Button>
          <Button color="inherit" href="/about">
            About Me
          </Button>
          <Button color="inherit" onMouseEnter={handleMenuOpen} onClick={handleMenuOpen}>
            Legacy Challenges
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            MenuListProps={{ onMouseLeave: handleMenuClose }}
            sx={{ mt: 1 }}
          >
            <MenuItem onClick={handleMenuClose} component="a" href="/Sims4/careerlegacychallenge">
              Career Legacy Challenge
            </MenuItem>
            <MenuItem disabled onClick={handleMenuClose} component="a" href="/Sims4/llamaslegends">
              Llamas &amp; Legends (Coming Soon!)
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
