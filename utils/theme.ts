// utils/theme.ts
'use client'
import { createTheme } from "@mui/material";

export const createAppTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: {
      main: "#9c27b0", // Purple
    },
    secondary: {
      main: "#ff4081", // Pink
    },
  },
});

const theme = createAppTheme('light');

export default theme;
