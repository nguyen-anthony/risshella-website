"use client";
import * as React from 'react';
import LoginWithTwitch from '@/components/common/LoginWithTwitch';
import CreatorsSearchGrid from '@/components/villagerhunt/CreatorsSearchGrid';
import { Alert, Box, Button, Container, Stack, Typography } from '@mui/material';
import type { Creator } from '@/types/creator';
import { getSessionFromCookie } from '@/app/lib/session';
import CreatorCard from '@/components/villagerhunt/CreatorCard';
import InfoDialog from '@/components/villagerhunt/InfoDialog';

type PageData = {
  creators: Creator[];
  session: ReturnType<typeof getSessionFromCookie> extends Promise<infer T> ? T : never;
  error?: Error | null;
  activeHunts: { hunt_id: string; hunt_name: string; twitch_id: number }[];
};

export default function VillagerHuntClient({ data }: { data: PageData }) {
  // Check if user has recently seen the info dialog
  const getInfoDialogExpiry = () => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('infoDialogExpiry');
    return stored ? new Date(stored) : null;
  };

  const setInfoDialogExpiry = (days: number = 30) => {
    if (typeof window === 'undefined') return;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);
    localStorage.setItem('infoDialogExpiry', expiry.toISOString());
  };

  const [infoDialogOpen, setInfoDialogOpen] = React.useState(false);

  React.useEffect(() => {
    const shouldShow = () => {
      const expiry = getInfoDialogExpiry();
      if (!expiry) return true;
      return new Date() > expiry;
    };
    
    setInfoDialogOpen(shouldShow());
  }, []);

  const handleInfoDialogClose = () => {
    setInfoDialogOpen(false);
    setInfoDialogExpiry(30); // Don't show again for 30 days
  };

  const { creators, session, error, activeHunts } = data;
  const selfCreator = session ? creators.find(c => c.twitch_username.toLowerCase() === session.login.toLowerCase()) : undefined;
  const creatorsForGrid = selfCreator ? creators.filter(c => c.twitch_id !== selfCreator.twitch_id) : creators;

  return (
    <>
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
        <Stack spacing={2} alignItems="center" textAlign="center">
          <Typography variant="h3" component="h1" fontWeight={700}>
            Animal Crossing Villager Hunt!
          </Typography>
          {session ? (
            selfCreator ? (
              <Box sx={{ width: '100%', maxWidth: 520 }}>
                <CreatorCard creator={selfCreator} statusText="Go to your hunt!" />
              </Box>
            ) : (
              <form action="/api/creators/create" method="post">
                <Button type="submit" variant="contained" color="primary">Start your own hunt!</Button>
              </form>
            )
          ) : (
            <LoginWithTwitch label="Login with Twitch to start/manage your hunts!"/>
          )}
        </Stack>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
            Active Hunts!
          </Typography>
          {error ? (
            <Alert severity="error">Error loading creators.</Alert>
          ) : (
            <CreatorsSearchGrid creators={creatorsForGrid} activeHunts={activeHunts} moderatedUsernames={[]} />
          )}
        </Box>
      </Container>

      <InfoDialog open={infoDialogOpen} onClose={handleInfoDialogClose} />
    </>
  );
}