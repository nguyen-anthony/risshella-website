"use client";
import * as React from 'react';
import { Box, Link, Typography } from '@mui/material';
import { usePathname } from 'next/navigation';

const LATEST_CHANGELOG_DATE = new Date('2025-11-17');

export default function ChangelogNotification() {
  const pathname = usePathname();
  const [showNotification, setShowNotification] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    // If on changelog page, mark as viewed
    if (pathname === '/villagerhunt/changelog') {
      localStorage.setItem('lastChangelogView', new Date().toISOString());
      setShowNotification(false);
      return;
    }

    const lastViewed = localStorage.getItem('lastChangelogView');
    const lastViewedDate = lastViewed ? new Date(lastViewed) : null;

    if (!lastViewedDate || LATEST_CHANGELOG_DATE > lastViewedDate) {
      setShowNotification(true);
    }
  }, [pathname]);

  const handleLinkClick = () => {
    localStorage.setItem('lastChangelogView', new Date().toISOString());
    setShowNotification(false);
  };

  if (!showNotification || pathname === '/villagerhunt/changelog') return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      {/* Character Image */}
      <Box
        component="img"
        src="/ront_character.png"
        alt="Ront Character"
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          border: '2px solid #fff',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        }}
      />

      {/* Speech Bubble */}
      <Box
        sx={{
          position: 'relative',
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '12px 16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          maxWidth: 250,
          '&::before': {
            content: '""',
            position: 'absolute',
            left: -8,
            bottom: 20,
            width: 0,
            height: 0,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: '8px solid #fff',
          },
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Hey there! There&apos;s new stuff in the{' '}
          <Link
            href="/villagerhunt/changelog"
            onClick={handleLinkClick}
            sx={{
              color: 'primary.main',
              textDecoration: 'underline',
              fontWeight: 600,
              '&:hover': {
                textDecoration: 'none',
              },
            }}
          >
            changelog
          </Link>
          ! Check it out! 🎉
        </Typography>
      </Box>
    </Box>
  );
}