import LoginWithTwitch from '@/components/LoginWithTwitch';
import CreatorsSearchGrid from '@/components/CreatorsSearchGrid';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { Alert, Box, Container, Stack, Typography } from '@mui/material';
import type { Creator } from '@/types/creator';

export default async function VillagerHunt() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from('creators')
        .select('twitch_id, twitch_username, avatar_url');

    const creators = (data ?? []) as Creator[];

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
            <Stack spacing={2} alignItems="center" textAlign="center">
                <Typography variant="h3" component="h1" fontWeight={700}>
                    Animal Crossing Villager Hunt!
                </Typography>
                <LoginWithTwitch returnTo="/villagerhunt" label="Login with Twitch to start/manage your hunts!"/>
            </Stack>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
                    Active Hunts!
                </Typography>
                {error ? (
                    <Alert severity="error">Error loading creators.</Alert>
                ) : (
                    <CreatorsSearchGrid creators={creators} />
                )}
            </Box>
        </Container>
    );
}