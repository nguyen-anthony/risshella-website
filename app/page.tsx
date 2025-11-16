"use client";

import styles from "./page.module.css";
import * as React from 'react';
import Navigation from '../components/Navigation';
import { Typography, Button, Stack, Container } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div>
      <Navigation/>
      <Container component="main" sx={{ mt: 8, mb: 8 }}>
        <Stack spacing={4} alignItems="center">
          <Typography variant="h2" component="h1" gutterBottom align="center">
            Welcome to Risshella&apos;s Website
          </Typography>
          <Typography variant="body1" component="p" gutterBottom align="center">
            Under Construction
          </Typography>
          <Typography variant="body1" component="p" gutterBottom align="center">
            In the meantime, check out some of the legacy challenges below!
          </Typography>
          <Stack spacing={3} alignItems="center">
            <Typography variant="h4" component="h2" gutterBottom align="center">
              Sims 4 Legacy Challenges
            </Typography>
            <Stack spacing={2} alignItems="center">
              <Button 
                variant="contained" 
                size="large"
                onClick={() => router.push('/sims4/careerlegacychallenge')}
                sx={{ minWidth: 250 }}
              >
                Career Legacy Challenge
              </Button>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => router.push('/sims4/llamaslegendslegacy')}
                sx={{ minWidth: 250 }}
              >
                Llamas Legends Legacy
              </Button>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => router.push('/villagerhunt')}
                sx={{ minWidth: 250 }}
              >
                Animal Crossing Villager Hunt
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Container>
      <footer className={styles.footer}>
        
      </footer>
    </div>
  );
}
