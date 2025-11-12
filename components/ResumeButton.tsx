'use client';

import * as React from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { createClient } from '@/utils/supabase/client';

type Props = {
  huntId: string;
  huntName: string;
  twitchId: number;
};

export default function ResumeButton({ huntId, huntName, twitchId }: Props) {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [activeHuntName, setActiveHuntName] = React.useState<string | null>(null);

  const handleResumeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const supabase = createClient();

    // Check for active hunt
    const { data: activeHunt } = await supabase
      .from('hunts')
      .select('hunt_name')
      .eq('twitch_id', twitchId)
      .eq('hunt_status', 'ACTIVE')
      .maybeSingle();

    if (!activeHunt) {
      // No active hunt, resume directly
      const form = document.createElement('form');
      form.method = 'post';
      form.action = '/api/hunts/resume';
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'hunt_id';
      input.value = huntId;
      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
    } else {
      // Active hunt exists, show modal
      setActiveHuntName(activeHunt.hunt_name);
      setModalOpen(true);
    }
  };

  const handleConfirmResume = () => {
    const form = document.createElement('form');
    form.method = 'post';
    form.action = '/api/hunts/resume';
    const input1 = document.createElement('input');
    input1.type = 'hidden';
    input1.name = 'hunt_id';
    input1.value = huntId;
    const input2 = document.createElement('input');
    input2.type = 'hidden';
    input2.name = 'pause_active';
    input2.value = 'true';
    form.appendChild(input1);
    form.appendChild(input2);
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <>
      <Button
        variant="contained"
        color="success"
        size="small"
        startIcon={<PlayArrowIcon />}
        onClick={handleResumeClick}
        sx={{ ml: 1 }}
      >
        Resume
      </Button>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>Resume Hunt</DialogTitle>
        <DialogContent>
          <Typography>
            There is an active hunt already called &quot;{activeHuntName}&quot;. Did you want to pause that hunt and resume this one: &quot;{huntName}&quot;?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>No</Button>
          <Button onClick={handleConfirmResume} color="primary" variant="contained">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}