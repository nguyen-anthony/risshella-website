import LoginWithTwitch from '@/components/LoginWithTwitch';
import CreatorsSearchGrid from '@/components/CreatorsSearchGrid';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { Alert, Box, Button, Container, Stack, Typography } from '@mui/material';
import type { Creator } from '@/types/creator';
import { refreshVillagersIfStale } from '@/app/lib/villagers';
import { getModeratedChannels } from '../lib/twitch';
import { getSessionFromCookie } from '@/app/lib/session';
import CreatorCard from '@/components/CreatorCard';

export default async function VillagerHunt() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const session = await getSessionFromCookie();

    // Opportunistic refresh of villagers table when stale (>24h). Silently ignores if API key missing.
    await refreshVillagersIfStale(supabase);

    const { data, error } = await supabase
        .from('creators')
        .select('twitch_id, twitch_username, display_name, avatar_url');

    const creators = (data ?? []) as Creator[];
    const selfCreator = session ? creators.find(c => c.twitch_username.toLowerCase() === session.login.toLowerCase()) : undefined;
    const creatorsForGrid = selfCreator ? creators.filter(c => c.twitch_id !== selfCreator.twitch_id) : creators;

    let moderatedUsernames: string[] = [];
    if (session?.accessToken && session?.userId) {
        try {
            const moderated = await getModeratedChannels(session.accessToken, session.userId);
            moderatedUsernames = moderated.map(ch => ch.broadcaster_login.toLowerCase());
        } catch {
            // Silently ignore errors fetching moderated channels
        }
    }

    return (
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
                    <LoginWithTwitch returnTo="/villagerhunt" label="Login with Twitch to start/manage your hunts!"/>
                )}
            </Stack>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
                    Active Hunts!
                </Typography>
                {error ? (
                    <Alert severity="error">Error loading creators.</Alert>
                ) : (
                    <CreatorsSearchGrid creators={creatorsForGrid} moderatedUsernames={moderatedUsernames} />
                )}
            </Box>
        </Container>
    );
}