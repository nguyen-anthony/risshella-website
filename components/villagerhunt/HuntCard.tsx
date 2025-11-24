'use client';

import * as React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import ResumeButton from './ResumeButton';

type Villager = {
  villager_id: number;
  name: string;
  image_url: string | null;
};

type Hunt = {
  hunt_id: string;
  hunt_name: string;
  target_villager_id: number[];
  hunt_status: string;
  start_ts: string;
  complete_ts?: string;
};

type Props = {
  hunt: Hunt;
  username: string;
  twitchId: number;
  villagersMap: Record<number, Villager>;
};

export default function HuntCard({ hunt, username, twitchId, villagersMap }: Props) {
  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on the resume button area
    if ((e.target as HTMLElement).closest('[data-resume-button]')) {
      return;
    }
    router.push(`/villagerhunt/${encodeURIComponent(username)}/history/${hunt.hunt_id}`);
  };

  const dreamies = hunt.target_villager_id.map((id: number) => villagersMap[id]).filter(Boolean);

  return (
    <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }} onClick={handleCardClick}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">{hunt.hunt_name}</Typography>
            <Typography variant="body2" color="text.secondary">
              Status: {hunt.hunt_status} { hunt.complete_ts ? `| Completed: ${new Date(hunt.complete_ts).toLocaleDateString()}` : ''}
            </Typography>
            {dreamies.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">Dreamies:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                  {dreamies.map((villager: Villager) => (
                    <Box key={villager.villager_id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        component="img"
                        src={`/villagers/${villager.name.toLowerCase().replace(/[^a-zA-Z0-9\u00C0-\u017F-]/g, '_')}.png`}
                        alt={villager.name}
                        sx={{ maxWidth: 40, maxHeight: 40, borderRadius: 1 }}
                      />
                      <Typography variant="body2">{villager.name}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
          {hunt.hunt_status === 'PAUSED' && (
            <ResumeButton huntId={hunt.hunt_id} huntName={hunt.hunt_name} twitchId={twitchId} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}