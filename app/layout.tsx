// app/layout.tsx
'use client'
import * as React from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { CacheProvider } from "@emotion/react";
import createEmotionCache from "@/utils/createEmotionCache";
import { createAppTheme } from "@/utils/theme";
import IssueReportButton from "@/components/common/IssueReportButton";
import { usePathname, useSearchParams } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider as CustomThemeProvider, useThemeMode } from "@/utils/ThemeContext";

const clientSideEmotionCache = createEmotionCache();

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { mode } = useThemeMode();
  const theme = createAppTheme(mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

function ConditionalIssueReportButton() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isOverlay = pathname.includes('/overlay');
  const isModEmbed = searchParams.get('modembed') === 'true';

  if (isOverlay || isModEmbed) return null;
  return <IssueReportButton />;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CacheProvider value={clientSideEmotionCache}>
          <CustomThemeProvider>
            <ThemeWrapper>
              {children}
              <React.Suspense fallback={null}>
                <ConditionalIssueReportButton />
              </React.Suspense>
              <Analytics />
            </ThemeWrapper>
          </CustomThemeProvider>
        </CacheProvider>
      </body>
    </html>
  );
}
