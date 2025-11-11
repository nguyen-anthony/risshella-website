// app/layout.tsx
'use client'
import * as React from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { CacheProvider } from "@emotion/react";
import createEmotionCache from "@/utils/createEmotionCache";
import theme from "@/utils/theme";
import IssueReportButton from "@/components/IssueReportButton";

const clientSideEmotionCache = createEmotionCache();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CacheProvider value={clientSideEmotionCache}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
            <IssueReportButton />
          </ThemeProvider>
        </CacheProvider>
      </body>
    </html>
  );
}
