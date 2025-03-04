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
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import {
  SiInstagram,
  SiX,
  SiYoutube,
  SiTwitch,
  SiBluesky,
  SiTiktok,
} from "react-icons/si";

const Navigation: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  // `isMobile` will be true if the viewport width is at or below the "sm" breakpoint
  const menuBreakpoint = useMediaQuery(theme.breakpoints.down("md"));
  const socialMediaBreakpoint = useMediaQuery(theme.breakpoints.down("sm"));

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleDrawer = () => {
    setDrawerOpen((prev) => !prev);
  };

  const navItems = [
    { title: "Home", href: "/" },
    { title: "About Me", href: "/about" },
  ];

  const legacyChallenges = [
    { title: "Career Legacy Challenge", href: "/Sims4/careerlegacychallenge" },
    { title: "Llamas & Legends Legacy", href: "/Sims4/llamaslegendslegacy" },
  ];

  return (
    <AppBar position="sticky" sx={{ backgroundColor: "black" }}>
      <Toolbar>
        {/* Left side: Title + Conditional Social Icons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="h6"
            component="a"
            href="/"
            sx={{ ml: 2, textDecoration: "none", color: "inherit" }}
          >
            Risshella
          </Typography>

          {/* Only show icons if not on mobile */}
          {!socialMediaBreakpoint && (
            <>
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
                href="https://bsky.app/profile/risshella.com"
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
            </>
          )}
        </Box>

        {/* Right side: Navigation links or hamburger menu */}
        {menuBreakpoint ? (
          <IconButton
            color="inherit"
            edge="end"
            onClick={toggleDrawer}
            sx={{ marginLeft: "auto" }}
          >
            <MenuIcon />
          </IconButton>
        ) : (
          <Box sx={{ display: "flex", gap: 2, marginLeft: "auto" }}>
            {navItems.map((item) => (
              <Button key={item.title} color="inherit" href={item.href}>
                {item.title}
              </Button>
            ))}
            <Button color="inherit" onClick={handleMenuOpen}>
              Legacy Challenges
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              {legacyChallenges.map((challenge) => (
                <MenuItem
                  key={challenge.title}
                  onClick={handleMenuClose}
                  component="a"
                  href={challenge.href}
                >
                  {challenge.title}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        )}
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer}>
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer}>
          <List>
            {navItems.map((item) => (
              <ListItem key={item.title} component="a" href={item.href}>
                <ListItemText primary={item.title} />
              </ListItem>
            ))}
            <ListItem onClick={handleMenuOpen}>
              <ListItemText primary="Legacy Challenges" />
            </ListItem>
            {legacyChallenges.map((challenge) => (
              <ListItem
                key={challenge.title}
                component="a"
                href={challenge.href}
              >
                <ListItemText primary={challenge.title} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Navigation;
