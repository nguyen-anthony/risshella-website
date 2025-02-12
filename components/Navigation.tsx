"use client"; // Necessary for client-side rendering
import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, Box } from "@mui/material";

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
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Risshella
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button color="inherit" href="/">
            Home
          </Button>
          <Button color="inherit" href="/about">
            About Me
          </Button>
          <Button
            color="inherit"
            onMouseEnter={handleMenuOpen}
            onClick={handleMenuOpen}
          >
            Legacy Challenges
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            MenuListProps={{
              onMouseLeave: handleMenuClose,
            }}
            sx={{ mt: 1 }}
          >
            <MenuItem onClick={handleMenuClose} component="a" href="/Sims4/careerlegacychallenge">
              Career Legacy Challenge
            </MenuItem>
            <MenuItem disabled onClick={handleMenuClose} component="a" href="/Sims4/llamaslegends">
              Llamas & Legends
            </MenuItem>
          </Menu>
        </Box>
        {/* <Box sx={{ display: "flex", gap: 1, marginLeft: "auto" }}>
          <Button color="inherit">User</Button>
          <Button color="inherit">Search</Button>
          <Button color="inherit">Cart</Button>
        </Box> */}
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
