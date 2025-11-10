'use client';

import { Typography } from '@mui/material';
import LoginWithTwitch from './LoginWithTwitch';

type AuthLinkProps = {
  username: string;
};

export default function AuthLink({ username }: AuthLinkProps) {
  return (
    <Typography variant="body2" sx={{ mt: 1 }}>
      Are you {username} or their mod?{' '}
      <LoginWithTwitch/>
    </Typography>
  );
}