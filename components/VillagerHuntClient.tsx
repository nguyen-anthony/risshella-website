"use client";
import * as React from 'react';
import LoginWithTwitch from '@/components/LoginWithTwitch';
import CreatorsSearchGrid from '@/components/CreatorsSearchGrid';
import { Alert, Box, Button, Container, Stack, Typography } from '@mui/material';
import type { Creator } from '@/types/creator';
import { getSessionFromCookie } from '@/app/lib/session';
import CreatorCard from '@/components/CreatorCard';
import InfoDialog from '@/components/InfoDialog';

type PageData = {
  creators: Creator[];
  session: ReturnType<typeof getSessionFromCookie> extends Promise<infer T> ? T : never;
  error?: Error | null;
};

export default function VillagerHuntClient({ data }: { data: PageData }) {
  const [infoDialogOpen, setInfoDialogOpen] = React.useState(true);

  const { creators, session, error } = data;
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
            <CreatorsSearchGrid creators={creatorsForGrid} moderatedUsernames={[]} />
          )}
        </Box>
      </Container>

      <InfoDialog open={infoDialogOpen} onClose={() => setInfoDialogOpen(false)} />
    </>
  );
}