"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function ChangelogPage() {
  const router = useRouter();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.back()}
        sx={{ mb: 3 }}
        variant="outlined"
      >
        Back
      </Button>

      <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
        Villager Hunt Changelog
      </Typography>

      <Box sx={{ mt: 3 }}>
        {/* Most recent changelog - expanded by default */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5" fontWeight="semibold">
              November 18, 2025 - v0.2.0
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Enhancements
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Improved pie chart statistics representation"/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Moved feature requests/bug reports to a public Trello board - https://trello.com/b/XUeuFFbu/acnh-villager-hunt"/>
              </ListItem>
            </List>

            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Bug Fixes
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Removed Changelog notification from overlay page"/>
              </ListItem>
            </List>

            
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5" fontWeight="semibold">
              November 17, 2025 - v0.1.0
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Enhancements
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Moved controls into a settings modal that can be opened via the cog wheel next to your name"/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Added ability to toggle your hunt as private or public." secondary="This will toggle whether you appear on the landing page `/villagerhunt`"/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Overlay URL is provided in the control modal"/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Navigation to `Home` added"/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Added ability to edit dreamies list"/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Added changelog"/>
              </ListItem>
            </List>

            
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5" fontWeight="semibold">
              November 16, 2025 - Initial Features/Details
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Initial Features added before today:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Twitch Authentication - Wow this was annoying to figure out!" secondary="Twitch Authentication is used to authenticate your own hunts and moderation of hunts. That is all."/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Designed relational database model to support multi-user villager hunt tracking" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Landing page `/villagerhunt` displays list of people that have started a hunt" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Dynamic hunt pages `/villagerhunt/{twitch_username}` to manage individual hunts and encounters" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Loaded villagers list from Nookipedia" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Added controls for hunt owners/creators" secondary="Start and Delete Hunt, Add/Update/Delete Encounters, Update status of hunt (complete, pause, abandon)"/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Modified controls to limit controls for mods" secondary="Add/Update/Delete Encounters"/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Real time updates to/from tables"/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Allow users to set a dreamie LIST instead of a single target villager"/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Add hunt history view"/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Filter/search on encounter table"/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Hunt Statistics"/>
              </ListItem>
            </List>

            {/* <Typography variant="h6" gutterBottom fontWeight="semibold" sx={{ mt: 2 }}>
              Bug Fixes:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Fixed issue with hunt pause/resume functionality" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Resolved display bug in encounters table on mobile devices" />
              </ListItem>
            </List> */}
{/* 
            <Typography variant="h6" gutterBottom fontWeight="semibold" sx={{ mt: 2 }}>
              Improvements:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Enhanced performance of hunt history loading" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Updated UI components for better accessibility" />
              </ListItem>
            </List> */}
          </AccordionDetails>
        </Accordion>

        {/* Previous changelogs - collapsed by default */}
        {/* <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5" fontWeight="semibold">
              October 15, 2025 - Version 1.4.2
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Bug Fixes:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Fixed authentication callback issues with Twitch login" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Corrected villager data synchronization problems" />
              </ListItem>
            </List>

            <Typography variant="h6" gutterBottom fontWeight="semibold" sx={{ mt: 2 }}>
              Improvements:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Optimized database queries for better performance" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Improved error handling in API routes" />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion> */}
      </Box>
    </Container>
  );
}
