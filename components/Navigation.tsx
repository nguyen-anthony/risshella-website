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
  useMediaQuery,
  useTheme,
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      <Toolbar sx={{ justifyContent: 'space-between', width: '100%' }}>
        {/* Left side: Title + Conditional Social Icons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="h6"
            component="a"
            href="/"
            sx={{ textDecoration: "none", color: "inherit" }}
          >
            Risshella
          </Typography>

          {!isMobile && (
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isMobile ? (
            <IconButton
              color="inherit"
              edge="end"
              onClick={toggleDrawer}
              sx={{ 
                display: 'block',
                marginLeft: 'auto', // Push to the right
                '& .MuiSvgIcon-root': {
                  fontSize: '2rem' // Make the icon bigger
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: "flex", gap: 2 }}>
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
        </Box>
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer 
        anchor="right" 
        open={drawerOpen} 
        onClose={toggleDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            width: '80%',
            maxWidth: 250,
            backgroundColor: 'black',
            color: 'white'
          },
        }}
      >
        <Box sx={{ width: '100%', pt: 2 }} role="presentation">
          <List>
            {navItems.map((item) => (
              <ListItem 
                key={item.title} 
                component="a" 
                href={item.href}
                onClick={toggleDrawer}
              >
                <ListItemText primary={item.title} />
              </ListItem>
            ))}
            {legacyChallenges.map((challenge) => (
              <ListItem
                key={challenge.title}
                component="a"
                href={challenge.href}
                onClick={toggleDrawer}
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
