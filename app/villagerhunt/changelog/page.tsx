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
  Divider,
  Link,
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
              All v0.15.x Updates
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="h5" fontWeight="semibold">
              March 5, 2026 - v0.15.1
            </Typography>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Bug Fixes
            </Typography>
            <ListItem>
              <ListItemText primary="Home Page Grid Not Showing Everyone" 
                secondary={`There are so many people that use this site now that I sometimes get limited on how many people show up from the database. This has been fixed now.
                  `}

                  slotProps={{
                    secondary: {
                      sx: { whiteSpace: 'pre-line' },
                      component: 'p'           // optional: control the rendered element
                    }
                  }}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="Twitch User Updates" 
                secondary={`If you changed your Twitch username or avatar/profile image recently, this wasn't being reflected on the site. This should be fixed now.
                  `}

                  slotProps={{
                    secondary: {
                      sx: { whiteSpace: 'pre-line' },
                      component: 'p'           // optional: control the rendered element
                    }
                  }}
              />
            </ListItem>
            <Divider />
            <Typography variant="h5" fontWeight="semibold">
              March 5, 2026 - v0.15.0
            </Typography>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Enhancements
            </Typography>
            <ListItem>
              <ListItemText primary="Downloadable hunt data!" 
                secondary={`You can now download your hunt data for each hunt, including your completed hunts in your history!
                  This downloads as a CSV file which you should be able to view in Excel, Google Sheets, etc. 
                  There's no easy way to make it uniform for everyone's needs, so you will have to transform it yourself however you want in your own spreadsheets.
                  I will NOT be adding a mass download option for all hunts, so you will need to go through each hunt and download them individually.
                  `}

                  slotProps={{
                    secondary: {
                      sx: { whiteSpace: 'pre-line' },
                      component: 'p'           // optional: control the rendered element
                    }
                  }}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="Downloadable bingo card images!" 
                secondary={`I've gotten a lot of great feedback regarding the interactive bingo card and I thank you all for that.
                  I've added an option to download your bingo card as an image in case you want to do manually marking in paint, photoshop, or whatever.
                  `}

                  slotProps={{
                    secondary: {
                      sx: { whiteSpace: 'pre-line' },
                      component: 'p'           // optional: control the rendered element
                    }
                  }}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="Creator-Controlled Bingo Card Default settings" 
                secondary={`Creators can now control the bingo card generation even more!
                  Say you want to host a bingo with only certain villager species or personalities!
                  Frog only bingo or something like that!
                  This also helps for villager hunts on your first few islands that are restricted to a few personalities.
                  Viewers can override your filter settings if they want to do their own bingo without abiding to your settings for funsies.
                  `}

                  slotProps={{
                    secondary: {
                      sx: { whiteSpace: 'pre-line' },
                      component: 'p'           // optional: control the rendered element
                    }
                  }}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="Remove Free Space option" 
                secondary={`In addition to the filters mentioned above, you can now remove the free space if you want to.
                  Creators can control this as a default setting but viewers can control it themselves too.
                  `}

                  slotProps={{
                    secondary: {
                      sx: { whiteSpace: 'pre-line' },
                      component: 'p'           // optional: control the rendered element
                    }
                  }}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="Play Bingo on past hunts!" 
                secondary={`For all you VOD watchers, I've enabled bingo cards on completed hunts!
                  So you can now generate bingo cards on completed hunts as if you're watching it live and play along with the VOD
                  `}

                  slotProps={{
                    secondary: {
                      sx: { whiteSpace: 'pre-line' },
                      component: 'p'           // optional: control the rendered element
                    }
                  }}
              />
            </ListItem>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5" fontWeight="semibold">
              All v0.14.x Updates
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="h5" fontWeight="semibold">
              February 13, 2026 - v0.14.2
            </Typography>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Enhancements
            </Typography>
            <ListItem>
              <ListItemText primary="Improved Bingo Card Drawer" 
                secondary={`The bingo card drawer can now be opened without taking over control focus!

                  You should be able to open the bingo card drawer and still interact with the rest of the page!
                  I also cleaned up the look of the drawer so that the bingo card grid is more of the focus.
                  `}

                  slotProps={{
                    secondary: {
                      sx: { whiteSpace: 'pre-line' },
                      component: 'p'           // optional: control the rendered element
                    }
                  }}
              />
            </ListItem>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Bug Fixes
            </Typography>
            <ListItem>
              <ListItemText primary="Inaccurate Hunt Statistics for 1000+ encounters" 
                secondary="First, can you get good and find your villagers faster? If not, then I corrected an issue where statistics were inaccurate if you had more than 1000 encounters."
              />
            </ListItem>
            <Divider/>
            <Typography variant="h5" fontWeight="semibold">
              February 13, 2026 - v0.14.1
            </Typography>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Enhancements
            </Typography>
            <ListItem>
              <ListItemText primary="Mobile-friendly bingo cards" 
                secondary={`Apologies to mobile users!

                  I am not the best at writing web applications that are mobile-friendly, so hopefully this is better!
                  On mobile screens, you will be directed to the "full-page" bingo card.
                  On larger screens, the bingo card will appear from a drawer that pops out from the right side of your screen.
                  `}

                  slotProps={{
                    secondary: {
                      sx: { whiteSpace: 'pre-line' },
                      component: 'p'           // optional: control the rendered element
                    }
                  }}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="New Villager Indicator Improvement" 
                secondary="The 'NEW' icon for when you encounter a new villager was sometimes not very clear depending on your browser settings.
                  I updated it so it's now a bright orange in all locations"
              />
            </ListItem>
            <Divider/>
            <Typography variant="h5" fontWeight="semibold">
              February 13, 2026 - v0.14.0
            </Typography>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Enhancements
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Interactive Bingo Cards!" 
                  secondary={`Bingo Cards are no longer just generated images. 
                    You can now make interactive bingo cards right on the webpage!

                    Generating bingo cards with all villagers or add filters.
                    You can even create your own custom cards (perfect to replace your card from before this update)!

                    Important: your card data is NOT stored by me.
                    It uses your browser cache.
                    There's download and upload features to help backup your bingo data.

                    Transparently, storing everyone's bingo cards and having live updates can get costly on the infrastructure.
                    I will evaluate after some time to see if it's feasible to do so!

                    As always, thank you for the support and feel free to provide feedback via the support button!
                    `}

                    slotProps={{
                      secondary: {
                        sx: { whiteSpace: 'pre-line' },
                        component: 'p'           // optional: control the rendered element
                      }
                    }}
                />
              </ListItem>
              <ListItem>
              <ListItemText
                primary="Chrome Extension for Mods and Streamers by Sery!"
                secondary={
                  <>
                    Sery did an amazing project to add a Chrome extension that adds the
                    encounters controls for mods and streamers to Twitch&apos;s mod view! Check
                    it out here at the Chrome Store under{" "}
                    <Link
                      href="https://chromewebstore.google.com/detail/villager-hunt-assistant/eflcjhalgdobabndeclijlpkoiogbeee"
                      target="_blank"
                      rel="noopener"
                    >
                      Villager Hunt Assistant
                    </Link>
                    .
                  </>
                }
              />
            </ListItem>
              <ListItem>
                <ListItemText primary="Collapsible island villager and dreamie lists" 
                  secondary="I pulled villager lists OUT of the modals and back on the main page, but put them in collapsible sections to help with organize the page."
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="Hunt Statistics Button Moved" 
                  secondary="The button for hunt statistics is now moved to the top as it's more of a navigation component."
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="Global Stats Button Visibility" 
                  secondary="The button to view global hunts is now more obvious."
                />
              </ListItem>
              
            </List>
            <Divider/>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              What is next?
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="I'm working on a better design to make this page more Animal Crossing friendly rather than a basic dark mode/light mode color theme."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Data Exporting" 
                  secondary="I am working on allowing users to export their hunt data to keep for yourselves!"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5" fontWeight="semibold">
              All v0.13.x Updates
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="h5" fontWeight="semibold">
              February 12, 2026 - v0.13.1
            </Typography>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Enhancements
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="New villager encounter indicator!" 
                  secondary="On the encounters table AND on the overlay, you should now see when you've seen any given villager for the first time on your hunt!"
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="Filter for villager lists!" 
                  secondary="Added the capability to filter villagers by species, personality, or sign in areas where the list of villagers appears (e.g. Add Encounter).
                    This should make things easier to find the villager you're looking for if you can't remember the name of the villager!"
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="Sorting statistics" 
                  secondary="I've added some sorting capabilities to hunt statistics and global statistics!"
                />
              </ListItem>
              
            </List>
            <Divider/>
            <Typography variant="h5" fontWeight="semibold">
              February 11, 2026 - v0.13.0
            </Typography>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Enhancements
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Amiibo Characters!" 
                  secondary="Amiibo characters from Sanrio, Zelda, and Splatoon are now available on the site. 
                    These characters can ONLY appear in the current island villagers list. 
                    These cannot appear in the hotel, bingo cards, or dreamies lists. These will not impact statistics either. 
                    This is only for the 'accuracy' for your current island villager lists when creating a hunt."
                />
              </ListItem>
            </List>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Bug Fixes
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Villager list ordering" 
                  secondary="Not sure why the villagers lists were never in alphabetical order. They are now!"
                />
              </ListItem>
            </List>
            <Divider/>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              What is next?
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="I'm working on a better design to make this page more Animal Crossing friendly rather than a basic dark mode/light mode color theme."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Interactive Bingo Card!" 
                  secondary="This is a bit more complex because I am trying to not require everyone to login to do this, but I am working on a hopefully slick solution to make this happen so you can stop saving your bingo cards locally!"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Data Exporting" 
                  secondary="I am working on allowing users to export their hunt data to keep for yourselves!"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5" fontWeight="semibold">
              February 7, 2026 - v0.12.0
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Enhancements
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Global statistics!" secondary="I'm proud to announce that global statistics are available via the button on the landing page!
                  This pulls data from all hunt data for people that are listed as 'public' in your settings.
                  If you are marked private, your data will not be included as I assume you don't want your hunt data publicly accessible.
                  This is NOT updated in realtime, it gets updated twice daily at 9:00 AM and 9:00 PM Eastern US time."/>
              </ListItem>
            </List>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Bug Fixes
            </Typography>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              What is next?
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="I'm working on a better design to make this page more Animal Crossing friendly rather than a basic dark mode/light mode color theme."/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Interactive Bingo Card!" secondary="This is a bit more complex because I am trying to not require everyone to login to do this, but I am working on a hopefully slick solution to make this happen so you can stop saving your bingo cards locally!"/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Amiibo Villagers!" secondary="This site was originally meant for one person, my wife. Supporting Ammibo characters was not on my priority. I am working on including Amiibo Villager support!"/>
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5" fontWeight="semibold">
              February 3, 2026 - v0.11.0
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Enhancements
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Less authentication refreshing!" secondary="You may have noticed that you have to Login With Twitch pretty frequently. I've made a change so that you should ideally only have to do this every 30 days-ish?"/>
              </ListItem>
            </List>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Bug Fixes
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Hunt Disappearing!" secondary="There had been reports of hunts disappearing and inability to start new hunts. This was due to a conflict error in the database. This should be fixed now! Please report if you see this again!"/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Unauthorized Errors!" secondary="People sometimes encountered an UNAUTHORIZED error. This was due to token expiration timing issues. This should be fixed now!"/>
              </ListItem>
            </List>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              What is next?
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="I'm working on a better design to make this page more Animal Crossing friendly rather than a basic dark mode/light mode color theme."/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Interactive Bingo Card!" secondary="This is a bit more complex because I am trying to not require everyone to login to do this, but I am working on a hopefully slick solution to make this happen so you can stop saving your bingo cards locally!"/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Amiibo Villagers!" secondary="This site was originally meant for one person, my wife. Supporting Ammibo characters was not on my priority. I am working on including Amiibo Villager support!"/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Global Stats!" secondary="Looking to add a global statistics page that will include data across all PUBLIC hunts. Anyone set to private will not be included in these statistics to respect privacy."/>
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5" fontWeight="semibold">
              January 22, 2026 - v0.10.0
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Enhancements
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="The main page now is more organized! Grid now has 30 hunters per page." secondary="Any creators that are live on Twitch will be at the top that have an active hunt. If you are not live but have a hunt active, you are next. Everyone else that does not have an active hunt will be sorted at the end."/>
              </ListItem>
              <ListItem>
                <ListItemText primary="If you are live on Twitch, your card will have a banner for you being live!"/>
              </ListItem>
            </List>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Bug Fixes
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Hunt statistics now take current island villagers and hotel guests into consideration."/>
              </ListItem>
            </List>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              What is next?
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="I'm working on a better design to make this page more Animal Crossing friendly rather than a basic dark mode/light mode color theme."/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Interactive Bingo Card!" secondary="This is a bit more complex because I am trying to not require everyone to login to do this, but I am working on a hopefully slick solution to make this happen so you can stop saving your bingo cards locally!"/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Amiibo Villagers!" secondary="This site was originally meant for one person, my wife. Supporting Ammibo characters was not on my priority. I am working on including Amiibo Villager support!"/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Global Stats!" secondary="Looking to add a global statistics page that will include data across all PUBLIC hunts. Anyone set to private will not be included in these statistics to respect privacy."/>
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5" fontWeight="semibold">
              January 22, 2026 - v0.9.0
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Enhancements
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="You can now add your island's hotel tourists in your hunt settings." secondary="Hotel tourists (AFAIK) can not show up on mystery islands, so these will be restricted from your bingo card too."/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Current island villagers (residents and tourists) are now in a modal popup instead of statically on the page all the time."/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Mods can now update the lists like dreamies, island villagers, and hotel tourists. Can also control bingo card settings."/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Added a new overlay for your dreamies on your stream as a browser source!" secondary="Use {your_hunt_url}/overlay/dreamies (e.g. risshella.com/villagerhunt/ront_tv/overlay/dreamies"/>
              </ListItem>
            </List>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Bug Fixes
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Encounters table had a limit of 1000 records. This has been fixed for all of you struggling with 1000+ villager hunts." secondary="Get good please."/>
              </ListItem>
              <ListItem>
                <ListItemText primary="As a temporary fix, I edited Jacob and Spork to have their UK names (Jakey and Crackle). I'm hoping for a better solution but data is limited"/>
              </ListItem>
            </List>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              What is next?
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="I'm working on a better design to make this page more Animal Crossing friendly rather than a basic dark mode/light mode color theme."/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Interactive Bingo Card!" secondary="This is a bit more complex because I am trying to not require everyone to login to do this, but I am working on a hopefully slick solution to make this happen so you can stop saving your bingo cards locally!"/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Amiibo Villagers!" secondary="This site was originally meant for one person, my wife. Supporting Ammibo characters was not on my priority. I am working on including Amiibo Villager support!"/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Global Stats!" secondary="Looking to add a global statistics page that will include data across all PUBLIC hunts. Anyone set to private will not be included in these statistics to respect privacy."/>
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5" fontWeight="semibold">
              December 21, 2025 - v0.8.0
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Enhancements
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Dynamic Bingo Card Generation - You can now set bingo cards to 3x3, 4x4, or 5x5." secondary="If there is truly any desire to make cards larger than this, please submit a request, but please understand that this image generation is insanely complex and it'll take some time <3"/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Display number of islands visited in the hunt history."/>
              </ListItem>
            </List>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Bug Fixes
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Fixed issue where encounter deletions were not updating on the overlay."/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Fixed issue where a name change causes issue with authentication."/>
              </ListItem>
            </List>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Notes
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="I'm aware that regional names and Amiibo characters are not available. I am working on a solution on how to make this better."/>
              </ListItem>
              <ListItem>
                <ListItemText primary="Ignore the fact that 0.7.0 is skipped. I scrapped every update related to it. Don't @ me :)"/>
              </ListItem>
              <ListItem>
                <ListItemText primary="There have been requests for allowing 10 villagers on the current island villagers list. Please let me know why this is necessary. If you have 10 villagers, you can't do a villager hunt AFAIK."/>
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5" fontWeight="semibold">
              December 1, 2025 - v0.6.0
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Enhancements
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Changed the update hunt status dropdown to individual buttons to make it more obvious on how to complete hunts instead of deleting them with the Delete Hunt button. Reminder that COMPLETING or ABANDONING a hunt will keep the hunt records in the history. Deleting will not." secondary="You know who you are."/>
              </ListItem>
            </List>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Bug Fixes
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Report button was covering up the pagination controls on the encounters table on mobile devices. Moved the report button for mobile devices."/>
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
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
