// app/layout.tsx
'use client'
import * as React from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { CacheProvider } from "@emotion/react";
import createEmotionCache from "@/utils/createEmotionCache";
import theme from "@/utils/theme";
import IssueReportButton from "@/components/common/IssueReportButton";
import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";

const clientSideEmotionCache = createEmotionCache();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isOverlay = pathname.includes('/overlay');

  return (
    <html lang="en">
      <body>
        <CacheProvider value={clientSideEmotionCache}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
            {!isOverlay && <IssueReportButton />}
            <Analytics />
          </ThemeProvider>
        </CacheProvider>
      </body>
    </html>
  );
}
