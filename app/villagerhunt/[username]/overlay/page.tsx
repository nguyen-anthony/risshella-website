'use client';

import { useEffect, useState, use } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import localFont from 'next/font/local';

const tommySoftFont = localFont({
  // Relative to this file: overlay -> [username] -> villagerhunt -> app
  src: '../../../MADE_Tommy_Soft_ExtraBold.otf',
  display: 'swap',
});

interface Hunt {
  hunt_id: string;
  hunt_name: string;
  hunt_status?: string;
}

interface Encounter {
  encounter_id: string;
  island_number: number;
  encountered_at: string;
  villager_id: number;
}

interface Villager {
  villager_id: number;
  name: string;
  image_url: string;
}

type PageProps = {
  params: Promise<{ username: string }>;
};

export default function OverlayPage({ params }: PageProps) {
  const { username: rawUsername } = use(params);
  const username = decodeURIComponent(rawUsername);
  const [hunt, setHunt] = useState<Hunt | null>(null);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [villagers, setVillagers] = useState<Villager[]>([]);
  const [huntName, setHuntName] = useState<string>('');
  const [creator, setCreator] = useState<{ twitch_id: number } | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const fetchData = async () => {
      // Find the creator by username
      const { data: creatorData } = await supabase
        .from('creators')
        .select('twitch_id')
        .eq('twitch_username', username.toLowerCase())
        .maybeSingle();

      if (!creatorData) return;

      setCreator(creatorData);

      const fetchHuntData = async () => {
        // Get the active hunt
        const { data: huntData } = await supabase
          .from('hunts')
          .select('hunt_id, hunt_name')
          .eq('twitch_id', creator?.twitch_id)
          .eq('hunt_status', 'ACTIVE')
          .maybeSingle();

        if (huntData) {
          setHunt(huntData);
          setHuntName(huntData.hunt_name || 'Hunt');

          // Get the 3 most recent encounters
          const { data: encountersData } = await supabase
            .from('encounters')
            .select('encounter_id, island_number, encountered_at, villager_id')
            .eq('hunt_id', huntData.hunt_id)
            .eq('is_deleted', false)
            .order('encountered_at', { ascending: false })
            .limit(3);

          if (encountersData) {
            setEncounters(encountersData);

            // Get villager data
            const villagerIds = encountersData.map((e) => e.villager_id).filter((id) => id !== null);
            if (villagerIds.length > 0) {
              const { data: villagersData } = await supabase
                .from('villagers')
                .select('villager_id, name, image_url')
                .in('villager_id', villagerIds);
              setVillagers(villagersData || []);
            }
          }
        } else {
          setHunt(null);
          setEncounters([]);
          setVillagers([]);
        }
      };

      // Initial fetch
      fetchHuntData();

      // Subscribe to hunt status changes
      const huntsChannel = supabase
        .channel('hunts-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'hunts',
            filter: `twitch_id=eq.${creatorData.twitch_id}`,
          },
          async (payload) => {
            const newHunt = payload.new as Hunt;
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              if (newHunt.hunt_status === 'ACTIVE') {
                setHunt(newHunt);
                setHuntName(newHunt.hunt_name || 'Hunt');
                // Fetch encounters for the new active hunt
                const { data: encountersData } = await supabase
                  .from('encounters')
                  .select('encounter_id, island_number, encountered_at, villager_id')
                  .eq('hunt_id', newHunt.hunt_id)
                  .eq('is_deleted', false)
                  .order('encountered_at', { ascending: false })
                  .limit(3);
                if (encountersData) {
                  setEncounters(encountersData);
                  const villagerIds = encountersData.map((e) => e.villager_id).filter((id) => id !== null);
                  if (villagerIds.length > 0) {
                    const { data: villagersData } = await supabase
                      .from('villagers')
                      .select('villager_id, name, image_url')
                      .in('villager_id', villagerIds);
                    setVillagers(villagersData || []);
                  }
                } else {
                  setEncounters([]);
                  setVillagers([]);
                }
              } else if (newHunt.hunt_status === 'COMPLETED' || newHunt.hunt_status === 'PAUSED') {
                setHunt(null);
                setEncounters([]);
                setVillagers([]);
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(huntsChannel);
      };
    };

    fetchData();
  }, [username]);

  useEffect(() => {
    if (!hunt) return;

    const supabase = createClient();

    const fetchEncounters = async () => {
      const { data: encountersData } = await supabase
        .from('encounters')
        .select('encounter_id, island_number, encountered_at, villager_id')
        .eq('hunt_id', hunt.hunt_id)
        .eq('is_deleted', false)
        .order('encountered_at', { ascending: false })
        .limit(3);
      if (encountersData) {
        setEncounters(encountersData);
        // Update villagers if needed
        const villagerIds = encountersData.map((e) => e.villager_id).filter((id) => id !== null);
        if (villagerIds.length > 0) {
          const { data: villagersData } = await supabase
            .from('villagers')
            .select('villager_id, name, image_url')
            .in('villager_id', villagerIds);
          setVillagers(villagersData || []);
        }
      }
    };

    // Set up WebSocket connection
    const ws = new WebSocket('wss://villagerhunt-websocket.fly.dev');

    ws.onopen = () => {
      console.log('Overlay WebSocket connected');
      // Subscribe to the creator's room
      ws.send(JSON.stringify({ type: 'subscribe', room: creator?.twitch_id.toString() }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'update') {
          console.log('Overlay WebSocket update:', message);
          // Refetch encounters on any update
          fetchEncounters();
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    ws.onclose = () => {
      console.log('Overlay WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('Overlay WebSocket error:', error);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'unsubscribe', room: creator?.twitch_id.toString() }));
        ws.close();
      }
    };
  }, [hunt, villagers, creator]);

  const villagerMap = new Map(villagers.map(v => [v.villager_id, v]));

  if (!hunt) {
    return (
      <Box sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent'
      }}>
        <style>{`body { background: transparent !important; }`}</style>
        <Typography sx={{
          color: 'white',
          fontSize: '48px',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          WebkitTextStroke: '1px black'
        }}>
          {hunt === null ? 'Loading...' : 'No Active Hunt'}
        </Typography>
      </Box>
    );
  }

  if (encounters.length === 0) {
    return (
      <Box sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent'
      }}>
        <style>{`body { background: transparent !important; }`}</style>
        <Typography sx={{
          color: 'white',
          fontSize: '48px',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          WebkitTextStroke: '1px black'
        }}>
          No encounters yet
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <style>{`body { background: transparent !important; }`}</style>
      <Box sx={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        backgroundColor: 'transparent',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 4
      }}>
        <Typography sx={{
          color: 'white',
          fontSize: '48px',
          fontFamily: tommySoftFont.style.fontFamily,
          fontWeight: 'bold',
          textShadow: '3px 3px 6px rgba(0,0,0,0.9)',
          WebkitTextStroke: '2px black',
          mb: 4,
          textAlign: 'center'
        }}>
          {huntName}
        </Typography>

        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          width: '100%',
          maxWidth: '600px'
        }}>
          {encounters.map((encounter) => {
            const villager = villagerMap.get(encounter.villager_id);
            return (
              <Box
                key={encounter.encounter_id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'rgba(53, 141, 248, 0.5)',
                  borderRadius: '8px',
                  p: 2,
                  border: '2px solid white',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.5)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{
                    position: 'relative',
                    width: '100px',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundImage: 'url(/island_image.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '8px',
                    border: '2px solid white',
                    overflow: 'hidden'
                  }}>
                    <Typography sx={{
                      color: 'white',
                      fontSize: '48px',
                      fontFamily: tommySoftFont.style.fontFamily,
                      fontWeight: 'bold',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.9)',
                      WebkitTextStroke: '2px black',
                      zIndex: 1
                    }}>
                      {encounter.island_number}
                    </Typography>
                  </Box>
                  {villager?.image_url && (
                    <Image
                      src={villager.image_url}
                      alt={villager.name}
                      width={60}
                      height={80}
                      style={{
                        maxWidth: '150px',
                        maxHeight: '150px',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        border: '2px solid white'
                      }}
                      unoptimized
                    />
                  )}
                  <Typography sx={{
                    color: 'white',
                    fontSize: '28px',
                    fontFamily: tommySoftFont.style.fontFamily,
                    fontWeight: 'bold',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    WebkitTextStroke: '1px black'
                  }}>
                    {villager?.name || `Unknown #${encounter.villager_id}`}
                  </Typography>
                </Box>
                <Typography sx={{
                  color: 'white',
                  fontSize: '32px',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                  WebkitTextStroke: '0.5px black',
                  opacity: 0.8
                }}>
                  {new Date(encounter.encountered_at).toLocaleTimeString()}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </>
  );
}