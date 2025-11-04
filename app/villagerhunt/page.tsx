import LoginWithTwitch from '@/components/LoginWithTwitch';

export default function VillagerHunt() {
    return (
        <div style={{ padding: 16 }}>
            <h2>Villager Hunts</h2>
            <p>Sign in to get admin access when eligible.</p>
            <LoginWithTwitch returnTo="/villagerhunt" />
        </div>
    );
}