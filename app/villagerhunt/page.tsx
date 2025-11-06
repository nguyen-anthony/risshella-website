import LoginWithTwitch from '@/components/LoginWithTwitch';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

type Creator = {
  twitch_id: number;
  twitch_username: string;
};

export default async function VillagerHunt() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
    .from('creators')
    .select('twitch_id, twitch_username');

    const creators = (data ?? []) as Creator[];

    return (
        <div style={{ padding: 16 }}>
            <h2>Animal Crossing Villager Hunts</h2>
            <p>Login if you are a creator or a mod</p>
            <LoginWithTwitch returnTo="/villagerhunt" />

            <div style={{ marginTop: 24 }}>
                <h3>Active Hunts!</h3>
                {error ? (
                    <p style={{ color: 'crimson' }}>Error loading creators.</p>
                    ) : creators.length > 0 ? (
                    <ul>
                        {creators.map((c) => (
                        <li key={c.twitch_id}>
                            {c.twitch_id} — {c.twitch_username}
                        </li>
                        ))}
                    </ul>
                    ) : (
                    <p style={{ color: '#666' }}>No creators found.</p>
                    )}
            </div>
        </div>
    );
}