"use client";
import React, { useEffect, useState } from 'react';
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
  Chip,
  CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  labels: { name: string; color: string }[];
  url: string;
}

interface TrelloData {
  lists: Record<string, string>;
  cards: Record<string, TrelloCard[]>;
}

export default function ChangelogPage() {
  const router = useRouter();
  const [trelloData, setTrelloData] = useState<TrelloData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrelloData = async () => {
      try {
        const res = await fetch('/api/trello/cards');
        if (res.ok) {
          const data = await res.json();
          setTrelloData(data);
        }
      } catch (error) {
        console.error('Failed to fetch Trello data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrelloData();
  }, []);

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
        {/* Trello Board Display */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Feature Requests & Bug Reports
          </Typography>
          <Typography variant="body1" gutterBottom>
            Full board found here: <a href="https://trello.com/b/XUeuFFbu/acnh-villager-hunt">https://trello.com/b/XUeuFFbu/acnh-villager-hunt</a>
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : trelloData ? (
            Object.entries(trelloData.cards).map(([listName, cards]) => (
              <Accordion key={listName}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" fontWeight="semibold">
                    {listName} ({cards.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {cards.length === 0 ? (
                    <Typography color="text.secondary">No cards in this list.</Typography>
                  ) : (
                    <List dense>
                      {cards.map((card) => (
                        <ListItem key={card.id} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                          <Box sx={{ width: '100%' }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {card.name}
                            </Typography>
                            {card.desc && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {card.desc}
                              </Typography>
                            )}
                            {card.labels.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                {card.labels.map((label) => (
                                  <Chip
                                    key={label.name}
                                    label={label.name}
                                    size="small"
                                    sx={{
                                      mr: 0.5,
                                      mb: 0.5,
                                      backgroundColor: label.color !== 'null' ? `#${label.color}` : 'default',
                                      color: 'white',
                                    }}
                                  />
                                ))}
                              </Box>
                            )}
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Typography color="error">Failed to load Trello data.</Typography>
          )}
        </Box>
        {/* Most recent changelog - expanded by default */}
        <Typography variant="h4" gutterBottom>
          Changelog
        </Typography>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5" fontWeight="semibold">
              November 24, 2025 - v0.5.0
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Enhancements
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="When you add an encounter, you can now immediately type to search for a villager, hitting TAB will select the top result, and then hit Enter to actually submit the encounter." secondary="Please report any issues with this!"/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Improved navigation between active hunt, hunt history, and when viewing previous hunts."/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Creators can now toggle bingo for an individual hunt in case they are villager hunting and don't want bingo cards."/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Creators can now add temporary mods. This only grants a specified Twitch user the ability to act like a mod for the villager hunt only. This should only be granted to viewers you trust."/>
              </ListItem>
            </List>

            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Bug Fixes
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Paused hunts always showed the resume button. It should now only show for the creator of the hunt."/>
              </ListItem>
            </List>

            
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5" fontWeight="semibold">
              November 23, 2025 - v0.4.0
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Enhancements
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Added island numbers to the landing page grid to show the current island number they are on in their hunt"/>
              </ListItem>
              <ListItem>
                <ListItemText primary="You've been able to search the encounters table with the 'Filter' icon, but no one knew that. I changed it to a search icon."/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Improved the loading time of images of villagers everywhere, including bingo card generation, encounters list, encounter controls, etc."/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Added trello board details to the changelog"/>
              </ListItem>
            </List>

            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Bug Fixes
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Fixed text color on Bingo Card when generating bingo cards in dark mode"/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Removed the navigation bar from the stream overlay page"/>
              </ListItem>
            </List>

            
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5" fontWeight="semibold">
              November 20, 2025 - v0.3.0
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Enhancements
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Added additional hunt statistics! Check them out!"/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Added the navigation from the main page and added supported dark mode"/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Name of your active hunt appears on grid"/>
              </ListItem>
            </List>

            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Bug Fixes
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Added ability to close change log notification"/>
              </ListItem>
            </List>

            
          </AccordionDetails>
        </Accordion>

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
