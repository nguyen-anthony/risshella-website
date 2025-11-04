'use client';

import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import type { ComponentProps } from 'react';

function TwitchIcon(props: ComponentProps<typeof SvgIcon>) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M4 3h16v11l-4 4h-4l-2 2H8v-2H4V3zm14 2H6v10h4v2l2-2h4l2-2V5zM13 7h2v5h-2V7zm-4 0h2v5H9V7z" />
    </SvgIcon>
  );
}

export default function LoginWithTwitch({ returnTo = '/villagerhunt' }: { returnTo?: string }) {
  const onClick = () => {
    const url = new URL('/api/auth/twitch', window.location.origin);
    if (returnTo) url.searchParams.set('return', returnTo);
    window.location.href = url.toString();
  };

  return (
    <Button variant="contained" color="primary" startIcon={<TwitchIcon />} onClick={onClick}>
      Login with Twitch
    </Button>
  );
}
