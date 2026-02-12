'use client';

import { useEffect, useState, use } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Box } from '@mui/material';
import Image from 'next/image';

interface Villager {
  villager_id: number;
  name: string;
  image_url: string;
}

type PageProps = {
  params: Promise<{ username: string }>;
};

export default function DreamiesOverlayPage({ params }: PageProps) {
  const { username: rawUsername } = use(params);
  const username = decodeURIComponent(rawUsername);
  const [dreamies, setDreamies] = useState<Villager[]>([]);

  useEffect(() => {
    const supabase = createClient();

    const fetchData = async () => {
      // Find the creator by username
      const { data: creator } = await supabase
        .from('creators')
        .select('twitch_id')
        .eq('twitch_username', username.toLowerCase())
        .maybeSingle();

      if (!creator) return;

      // Get the active hunt with target villagers
      const { data: huntData } = await supabase
        .from('hunts')
        .select('hunt_id, hunt_name, target_villager_id')
        .eq('twitch_id', creator.twitch_id)
        .eq('hunt_status', 'ACTIVE')
        .maybeSingle();

      if (huntData && huntData.target_villager_id && huntData.target_villager_id.length > 0) {
        // Get villager data for dreamies
        const { data: villagersData } = await supabase
          .from('villagers')
          .select('villager_id, name, image_url, amiibo_only, species, personality, sign')
          .in('villager_id', huntData.target_villager_id)
          .order('name');

        if (villagersData) {
          setDreamies(villagersData);
        }
      }
    };

    fetchData();

    // Subscribe to hunt changes
    const supabaseClient = createClient();
    const channel = supabaseClient
      .channel('dreamies-overlay-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hunts',
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [username]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 0.5, // Minimal gap between images
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {dreamies.map((villager) => (
          <Box
            key={villager.villager_id}
            sx={{
              position: 'relative',
              width: 80,
              height: 80,
              flexShrink: 0,
            }}
          >
            <Image
              src={villager.image_url || '/placeholder.png'}
              alt={villager.name}
              fill
              style={{
                objectFit: 'contain',
                borderRadius: 8,
              }}
              unoptimized
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}