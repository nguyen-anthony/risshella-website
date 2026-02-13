'use client';

import * as React from 'react';
import { Box, Button, Container, Stack, Typography, Drawer, IconButton, Divider, List, ListItem, ListItemText, ListItemIcon, Dialog, DialogTitle, DialogContent, DialogActions, Switch, FormControlLabel, Tooltip, Chip, Paper, Collapse, useMediaQuery, useTheme } from '@mui/material';
import Link from 'next/link';
import HelpIcon from '@mui/icons-material/Help';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CasinoIcon from '@mui/icons-material/Casino';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BarChartIcon from '@mui/icons-material/BarChart';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PauseIcon from '@mui/icons-material/Pause';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove'
import SortIcon from '@mui/icons-material/Sort';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import HistoryIcon from '@mui/icons-material/History';
import OwnerHuntControls from '@/components/villagerhunt/controls/OwnerHuntControls';
import EncountersTable from '@/components/villagerhunt/tables/EncountersTable';
import AuthLink from '@/components/villagerhunt/controls/AuthLink';
import { selectBingoVillagers, type BingoFilters } from '@/utils/bingoCardGenerator';
import UpdateIslandVillagersModal from '@/components/villagerhunt/modals/UpdateIslandVillagersModal';
import UpdateTargetVillagersModal from '@/components/villagerhunt/modals/UpdateTargetVillagersModal';
import BingoCardDrawer from '@/components/villagerhunt/drawers/BingoCardDrawer';
import HuntStatisticsModal from '@/components/villagerhunt/modals/HuntStatisticsModal';
import BingoCardControlModal from '@/components/villagerhunt/modals/BingoCardControlModal';
import InactiveHuntNotification from '@/components/villagerhunt/notifications/InactiveHuntNotification';
import AddTempModModal from '@/components/villagerhunt/modals/AddTempModModal';
import TempModsTable from '@/components/villagerhunt/tables/TempModsTable';
import HuntSettingsModal from '@/components/villagerhunt/modals/HuntSettingsModal';
import ConfirmDeleteModal from '@/components/villagerhunt/modals/ConfirmDeleteModal';
import DreamieFoundModal from '@/components/villagerhunt/modals/DreamieFoundModal';
import PublicPrivateToggleModal from '@/components/villagerhunt/modals/PublicPrivateToggleModal';
import VillagerDisplay from '@/components/villagerhunt/displays/VillagerDisplay';
import { useVillagers, useBingoCard } from '@/components/villagerhunt/hooks';
import { createClient } from '@/utils/supabase/client';
import { cleanupOldBingoCards } from '@/utils/villagerhunt/bingoCardCleanup';
import type { Hunt, Villager, Session } from '@/types/villagerhunt';

type Props = {
  initialDisplayName: string;
  initialTwitchId: number;
  initialSession: Session | null;
  initialIsOwner: boolean;
  initialIsModerator: boolean;
  initialUsername: string;
  isModEmbed?: boolean;
};

export default function HuntPageWrapper({
  initialDisplayName,
  initialTwitchId,
  initialSession,
  initialIsOwner,
  initialIsModerator,
  initialUsername,
  isModEmbed = false,
}: Props) {
  const [hunt, setHunt] = React.useState<Hunt | null>(null);
  const [huntLoading, setHuntLoading] = React.useState(true);
  const { villagers } = useVillagers(); // Exclude amiibo-only
  const { villagers: allVillagers } = useVillagers({ includeAmiiboOnly: true }); // Include all
  const [generatingBingo, setGeneratingBingo] = React.useState(false);
  const [updateIslandModalOpen, setUpdateIslandModalOpen] = React.useState(false);
  const [updateTargetModalOpen, setUpdateTargetModalOpen] = React.useState(false);
  const [bingoCardDrawerOpen, setBingoCardDrawerOpen] = React.useState(false);
  const [instructionsDrawerOpen, setInstructionsDrawerOpen] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [huntStatsModalOpen, setHuntStatsModalOpen] = React.useState(false);
  const [isModerator, setIsModerator] = React.useState(initialIsModerator);
  const [settingsModalOpen, setSettingsModalOpen] = React.useState(false);
  const [isPublic, setIsPublic] = React.useState<boolean>(false);
  const [isBingoEnabled, setIsBingoEnabled] = React.useState<boolean>(false);
  const [bingoCardSize, setBingoCardSize] = React.useState<number>(5);
  const [bingoSettingsModalOpen, setBingoSettingsModalOpen] = React.useState(false);
  const [tempModsModalOpen, setTempModsModalOpen] = React.useState(false);
  const [addTempModModalOpen, setAddTempModModalOpen] = React.useState(false);
  const [overlayUrl, setOverlayUrl] = React.useState<string>('');
  const [dreamieModalOpen, setDreamieModalOpen] = React.useState(false);
  const [isTempMod, setIsTempMod] = React.useState(false);
  const [islandDetailsExpanded, setIslandDetailsExpanded] = React.useState(false);
  const [dreamieListExpanded, setDreamieListExpanded] = React.useState(true);
  const [showInactiveNotification, setShowInactiveNotification] = React.useState(false);
  const [isLive, setIsLive] = React.useState(false);
  const [publicToggleModalOpen, setPublicToggleModalOpen] = React.useState(false);
  
  // Mobile detection for bingo card
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [pendingPublicValue, setPendingPublicValue] = React.useState<boolean | null>(null);
  const [showPublicTooltip, setShowPublicTooltip] = React.useState<boolean>(true);

  // Bingo card hook - uses localStorage
  const bingoCard = useBingoCard(hunt?.hunt_id || '');

  // Fetch hunt data
  const fetchHuntData = React.useCallback(async () => {
    const supabase = createClient();
    
    // Add a timeout to prevent hanging forever on iOS
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 15000);
    });

    try {
      setHuntLoading(true);
      
      // Fetch ACTIVE or INACTIVE hunt with timeout
      const huntPromise = supabase
        .from('hunts')
        .select('*')
        .eq('twitch_id', initialTwitchId)
        .in('hunt_status', ['ACTIVE', 'INACTIVE'])
        .order('hunt_id', { ascending: false })
        .maybeSingle();
      
      const { data: huntData, error: huntError } = await Promise.race([huntPromise, timeoutPromise]) as Awaited<typeof huntPromise>;

      if (huntError) {
        console.error('Hunt fetch error:', huntError);
      } else {
        setHunt(huntData);
      }
    } catch (error) {
      console.error('Error fetching hunt data:', error);
      // Always stop loading even on error
      setHuntLoading(false);
      // If 401, perhaps set a flag to show login
      if (error instanceof Error && error.message.includes('401')) {
        // Handle auth error, e.g., redirect to login
        window.location.href = '/auth'; // or show a login button
      }
      return; // Exit early since finally will set loading false again
    } finally {
      setHuntLoading(false);
    }
  }, [initialTwitchId]);

  // Initial fetch
  React.useEffect(() => {
    fetchHuntData();
    // Clean up old bingo cards from localStorage
    cleanupOldBingoCards();
  }, [fetchHuntData]);

  // Show inactive notification when hunt status is INACTIVE
  React.useEffect(() => {
    if (hunt && hunt.hunt_status === 'INACTIVE') {
      setShowInactiveNotification(true);
    } else {
      setShowInactiveNotification(false);
    }
  }, [hunt]);

  // Check if streamer is live
  React.useEffect(() => {
    const checkLiveStatus = async () => {
      try {
        const response = await fetch('/api/twitch/streams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ twitchId: initialTwitchId }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsLive(data.isLive || false);
        }
      } catch (error) {
        console.error('Failed to check live status:', error);
      }
    };

    checkLiveStatus();
    // Check every 60 seconds
    const interval = setInterval(checkLiveStatus, 300000);
    
    return () => clearInterval(interval);
  }, [initialTwitchId]);

  // Check moderator status client-side
  React.useEffect(() => {
    if (initialIsOwner || !initialSession) return;
    fetch(`/api/moderator/${initialTwitchId}`)
      .then(res => res.json())
      .then(data => setIsModerator(data.isModerator))
      .catch(() => setIsModerator(false));
  }, [initialIsOwner, initialSession, initialTwitchId]);

  // Check temp mod status
  React.useEffect(() => {
    if (!initialSession) return;
    fetch(`/api/temp-mods/check?creatorTwitchId=${initialTwitchId}&userTwitchId=${initialSession.userId}`)
      .then(res => res.json())
      .then(data => setIsTempMod(data.isTempMod))
      .catch(() => setIsTempMod(false));
  }, [initialSession, initialTwitchId]);

  // Fetch creator public status
  React.useEffect(() => {
    const fetchCreatorData = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('creators')
        .select('is_public')
        .eq('twitch_id', initialTwitchId)
        .maybeSingle();
      if (data) {
        setIsPublic(data.is_public ?? false);
      }
    };
    fetchCreatorData();
  }, [initialTwitchId]);

  // Set up real-time subscription for hunt changes
  React.useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('hunts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hunts',
          filter: `twitch_id=eq.${initialTwitchId}`,
        },
        (payload) => {
          console.log('Hunt realtime update:', payload);
          // Refetch hunt data on any change to hunts for this creator
          fetchHuntData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialTwitchId, fetchHuntData]);

  // Handle bingo card generation
  const handleGenerateBingoCard = async (filters?: BingoFilters) => {
    if (!hunt) return;

    setGeneratingBingo(true);

    try {
      const villagerIds = selectBingoVillagers({
        targetVillagers: targetVillagers,
        islandVillagers: hunt.island_villagers,
        hotelTourists: hunt.hotel_tourists,
        villagers,
        bingoCardSize: hunt.bingo_card_size,
        filters,
      });

      bingoCard.generateCard(villagerIds, hunt.bingo_card_size);
    } catch (error) {
      console.error('Failed to generate bingo card:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate bingo card');
    } finally {
      setGeneratingBingo(false);
    }
  };

  // Handle custom bingo card creation
  const handleGenerateCustomBingoCard = (villagerIds: number[]) => {
    if (!hunt) return;
    bingoCard.generateCard(villagerIds, hunt.bingo_card_size);
  };

  // Handle hunt statistics modal
  const handleHuntStats = () => {
    setHuntStatsModalOpen(true);
  };

  // Handle public toggle - show confirmation modal
  const handlePublicToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setPendingPublicValue(newValue);
    setPublicToggleModalOpen(true);
  };

  // Handle confirmed public toggle
  const handleConfirmPublicToggle = async () => {
    if (pendingPublicValue === null) return;
    
    const previousValue = isPublic;
    setIsPublic(pendingPublicValue);
    setPublicToggleModalOpen(false);
    
    try {
      const res = await fetch('/api/creators/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_public: pendingPublicValue }),
      });
      if (!res.ok) {
        throw new Error('Failed to update');
      }
    } catch (error) {
      console.error('Failed to update public status:', error);
      // Revert on error
      setIsPublic(previousValue);
    } finally {
      setPendingPublicValue(null);
    }
  };

  // Resolve target villagers data
  const [targetVillagers, setTargetVillagers] = React.useState<Villager[]>([]);

  React.useEffect(() => {
    if (!hunt?.target_villager_id || hunt.target_villager_id.length === 0) {
      setTargetVillagers([]);
      return;
    }
    const targetVillagersData = villagers.filter(v => hunt.target_villager_id.includes(v.villager_id));
    setTargetVillagers(targetVillagersData);
  }, [hunt?.target_villager_id, villagers]);

  // Resolve island villagers data
  const [islandVillagersData, setIslandVillagersData] = React.useState<Villager[]>([]);

  React.useEffect(() => {
    if (!hunt?.island_villagers || hunt.island_villagers.length === 0) {
      setIslandVillagersData([]);
      return;
    }
    const islandVillagers = allVillagers.filter(v => hunt.island_villagers.includes(v.villager_id));
    setIslandVillagersData(islandVillagers);
  }, [hunt?.island_villagers, allVillagers]);

  // Resolve hotel tourists data
  const [hotelTouristsData, setHotelTouristsData] = React.useState<Villager[]>([]);

  React.useEffect(() => {
    if (!hunt?.hotel_tourists || hunt.hotel_tourists.length === 0) {
      setHotelTouristsData([]);
      return;
    }
    const hotelTourists = villagers.filter(v => hunt.hotel_tourists.includes(v.villager_id));
    setHotelTouristsData(hotelTourists);
  }, [hunt?.hotel_tourists, villagers]);

  // Set bingo enabled state from hunt data
  React.useEffect(() => {
    if (hunt) {
      setIsBingoEnabled(hunt.is_bingo_enabled ?? false);
      setBingoCardSize(hunt.bingo_card_size ?? 5);
    }
  }, [hunt, hunt?.is_bingo_enabled, hunt?.bingo_card_size]);

  // Set overlay URL on client side
  React.useEffect(() => {
    setOverlayUrl(`${window.location.href.replace(/\/$/, '')}/overlay`);
  }, []);

  // Load tooltip visibility from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem('showPublicPrivateTooltip');
    if (stored !== null) {
      setShowPublicTooltip(stored === 'true');
    }
  }, []);

  // Toggle tooltip visibility and save to localStorage
  const toggleTooltipVisibility = () => {
    const newValue = !showPublicTooltip;
    setShowPublicTooltip(newValue);
    localStorage.setItem('showPublicPrivateTooltip', String(newValue));
  };

  // Render minimal mod-embed view
  if (isModEmbed) {
    return (
      <Box sx={{ p: 2 }}>
        {huntLoading ? (
          <Typography variant="body2" color="text.secondary">Loading...</Typography>
        ) : !hunt ? (
          <Typography variant="body2" color="text.secondary">No active hunt</Typography>
        ) : (
          <>
            <EncountersTable 
              villagers={villagers} 
              isOwner={initialIsOwner} 
              isModerator={isModerator} 
              huntId={hunt.hunt_id} 
              targetVillagerIds={hunt.target_villager_id} 
              onDreamieFound={() => { 
                if (hunt && !localStorage.getItem(`dreamiePopupShown_${hunt.hunt_id}`)) 
                  setDreamieModalOpen(true); 
              }} 
            />
            <DreamieFoundModal
              open={dreamieModalOpen}
              onClose={() => setDreamieModalOpen(false)}
              huntId={hunt.hunt_id}
              onComplete={() => {
                const form = document.createElement('form');
                form.method = 'post';
                form.action = '/api/hunts/complete';
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'hunt_id';
                input.value = hunt.hunt_id;
                form.appendChild(input);
                document.body.appendChild(form);
                form.submit();
              }}
            />
          </>
        )}
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
      {/* Help Button for authenticated owners/moderators */}
      {(initialIsOwner || isModerator) && initialSession && (
        <Box sx={{ position: 'fixed', top: 80, right: 20, zIndex: 1000 }}>
          <IconButton
            onClick={() => setInstructionsDrawerOpen(true)}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' },
              boxShadow: 3
            }}
            size="large"
          >
            <HelpIcon />
          </IconButton>
        </Box>
      )}

      {/* Always present elements */}
      <Stack spacing={0.5} sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="h4" component="h1" fontWeight={700}>{initialDisplayName}</Typography>
          {isLive && (
            <Chip
              label="Live on Twitch!"
              color="error"
              size="small"
              component="a"
              href={`https://www.twitch.tv/${initialUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              clickable
              sx={{
                fontWeight: 700,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.85 }
                },
                cursor: 'pointer',
                textDecoration: 'none',
                '&:hover': {
                  backgroundColor: 'error.dark',
                }
              }}
            />
          )}
          {(initialIsOwner || isModerator || isTempMod) && (
            <>
              <Tooltip title="Hunt Settings">
                <IconButton onClick={() => setSettingsModalOpen(true)}><SettingsIcon /></IconButton>
              </Tooltip>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isPublic}
                      onChange={handlePublicToggle}
                    />
                  }
                  label={isPublic ? "Public" : "Private"}
                />
                <Paper
                  elevation={3}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: 'calc(100% + 15px)',
                    transform: 'translateY(-50%)',
                    bgcolor: 'grey.800',
                    color: 'white',
                    px: showPublicTooltip ? 2 : 1,
                    py: 1,
                    borderRadius: 1,
                    minWidth: showPublicTooltip ? '280px' : 'auto',
                    maxWidth: '400px',
                    width: showPublicTooltip ? 'max-content' : 'auto',
                    zIndex: 1,
                    textAlign: 'center',
                    whiteSpace: 'normal',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '-8px',
                      transform: 'translateY(-50%)',
                      width: 0,
                      height: 0,
                      borderTop: '8px solid transparent',
                      borderBottom: '8px solid transparent',
                      borderRight: '8px solid',
                      borderRightColor: 'grey.800',
                    }
                  }}
                >
                  {showPublicTooltip ? (
                    <>
                      <Typography variant="caption" sx={{ fontSize: '0.75rem', lineHeight: 1.4, flex: 1 }}>
                        {isPublic 
                          ? "Set this to Private to make your hunts private!" 
                          : "Set this to Public to be searchable on the home page and your data will be used in global stats!"
                        }
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={toggleTooltipVisibility}
                        sx={{ color: 'white', p: 0.5 }}
                      >
                        <VisibilityOffIcon fontSize="small" />
                      </IconButton>
                    </>
                  ) : (
                    <IconButton
                      size="small"
                      onClick={toggleTooltipVisibility}
                      sx={{ color: 'white', p: 0.5 }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  )}
                </Paper>
              </Box>
            </>
          )}
        </Box>
        {!initialSession && <AuthLink username={initialDisplayName} />}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component={Link} href={`/villagerhunt`} variant="outlined" startIcon={<HomeIcon />}>
            Home
          </Button>
          <Button component={Link} href={`/villagerhunt/${encodeURIComponent(initialUsername)}/history`} variant="outlined" startIcon={<HistoryIcon />}>
            View Hunt History
          </Button>
          {hunt && (
            <Button variant="outlined" startIcon={<BarChartIcon />} onClick={handleHuntStats}>
              Hunt Statistics
            </Button>
          )}
        </Box>
      </Stack>

      {/* Conditional content based on hunt existence */}
      {huntLoading ? (
        <Box>
          <Typography variant="h6" color="text.secondary">Loading hunt data...</Typography>
        </Box>
      ) : !hunt ? (
        <Box>
          <Typography variant="h6" color="text.secondary">No active hunt</Typography>
          {initialIsOwner && <OwnerHuntControls showStart onHuntCreated={fetchHuntData} />}
        </Box>
      ) : (
        <Box>
          <Typography variant="h6" component="h2" color="text.secondary" sx={{ mb: 2 }}>{hunt.hunt_name}</Typography>

          {targetVillagers.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Button
                onClick={() => setDreamieListExpanded(!dreamieListExpanded)}
                endIcon={<ExpandMoreIcon sx={{ transform: dreamieListExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />}
                sx={{ mb: 1, textTransform: 'none' }}
              >
                <Typography variant="body2" color="text.secondary">
                  Dreamie List
                </Typography>
              </Button>
              <Collapse in={dreamieListExpanded}>
                <Box sx={{ pl: 2 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {targetVillagers.map((villager) => (
                      <VillagerDisplay key={villager.villager_id} villager={villager} variant="card" />
                    ))}
                  </Box>
                </Box>
              </Collapse>
            </Box>
          )}

          {/* Island Villagers & Hotel Guests Collapsible Section */}
          {(islandVillagersData.length > 0 || hotelTouristsData.length > 0) && (
            <Box sx={{ mb: 2 }}>
              <Button
                onClick={() => setIslandDetailsExpanded(!islandDetailsExpanded)}
                endIcon={<ExpandMoreIcon sx={{ transform: islandDetailsExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />}
                sx={{ mb: 1, textTransform: 'none' }}
              >
                <Typography variant="body2" color="text.secondary">
                  Island Villagers & Hotel Guests
                </Typography>
              </Button>
              <Collapse in={islandDetailsExpanded}>
                <Box sx={{ pl: 2 }}>
                  {islandVillagersData.length > 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">Current Island Villagers:</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {islandVillagersData.map((villager) => (
                          <VillagerDisplay key={villager.villager_id} villager={villager} variant="card" />
                        ))}
                      </Box>
                    </Box>
                  )}
                  {hotelTouristsData.length > 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">Current Hotel Tourists:</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {hotelTouristsData.map((villager) => (
                          <VillagerDisplay key={villager.villager_id} villager={villager} variant="card" />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Collapse>
            </Box>
          )}

          {isBingoEnabled && (
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CasinoIcon />}
                onClick={() => isMobile ? null : setBingoCardDrawerOpen(!bingoCardDrawerOpen)}
                component={isMobile ? Link : 'button'}
                href={isMobile ? `/villagerhunt/${initialUsername}/bingocard` : undefined}
              >
                Bingo Card
              </Button>
            </Box>
          )}

          <EncountersTable villagers={villagers} isOwner={initialIsOwner} isModerator={isModerator} huntId={hunt.hunt_id} targetVillagerIds={hunt.target_villager_id} onDreamieFound={() => { if (hunt && !localStorage.getItem(`dreamiePopupShown_${hunt.hunt_id}`)) setDreamieModalOpen(true); }} />

          <UpdateIslandVillagersModal
            open={updateIslandModalOpen}
            onClose={() => setUpdateIslandModalOpen(false)}
            huntId={hunt.hunt_id}
            currentIslandVillagers={hunt.island_villagers}
            currentHotelTourists={hunt.hotel_tourists}
            villagers={villagers}
            allVillagers={allVillagers}
            onUpdated={fetchHuntData}
          />

          <UpdateTargetVillagersModal
            open={updateTargetModalOpen}
            onClose={() => setUpdateTargetModalOpen(false)}
            huntId={hunt.hunt_id}
            currentTargetVillagers={hunt.target_villager_id}
            villagers={villagers}
            onUpdated={fetchHuntData}
          />

          <BingoCardDrawer
            open={bingoCardDrawerOpen}
            onClose={() => setBingoCardDrawerOpen(false)}
            onGenerate={handleGenerateBingoCard}
            onGenerateCustom={handleGenerateCustomBingoCard}
            onClear={bingoCard.clearCard}
            cardData={bingoCard.cardData}
            villagers={allVillagers}
            onSquareClick={bingoCard.toggleSquare}
            loading={generatingBingo}
            targetVillagers={targetVillagers}
            islandVillagers={hunt.island_villagers}
            hotelTourists={hunt.hotel_tourists}
            bingoCardSize={hunt.bingo_card_size}
            username={initialUsername}
            huntName={hunt.hunt_name}
            onRestoreCard={bingoCard.restoreCard}
          />

          {/* Delete Confirmation Modal */}
          <Dialog
            open={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
          >
            <DialogTitle>Delete Hunt</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete this hunt?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Deleted hunts will not show up in your history. Consider changing the status to paused or abandoned instead if you want to see it in your history.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteModalOpen(false)}>No</Button>
              <Button
                onClick={() => {
                  const form = document.createElement('form');
                  form.method = 'post';
                  form.action = '/api/hunts/delete';
                  const input = document.createElement('input');
                  input.type = 'hidden';
                  input.name = 'hunt_id';
                  input.value = hunt.hunt_id;
                  form.appendChild(input);
                  document.body.appendChild(form);
                  form.submit();
                }}
                color="error"
                variant="contained"
              >
                Yes
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}

      {/* Instructions Drawer */}
      <Drawer
        anchor="right"
        open={instructionsDrawerOpen}
        onClose={() => setInstructionsDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '90vw', sm: '400px' },
            p: 2
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Hunt Controls Guide
          </Typography>
          <IconButton onClick={() => setInstructionsDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          This guide explains all the controls available for managing your villager hunt.
        </Typography>

        <List>
          <ListItem>
            <ListItemIcon>
              <CasinoIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Bingo Card"
              secondary="View and interact with your bingo card. Click the button to open the card in a side panel where you can generate new cards and mark squares as you find villagers."
            />
          </ListItem>
          
          {initialIsOwner && (
            <>
              <ListItem>
                <ListItemIcon>
                  <EditIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Update Island Villagers/Tourists"
                  secondary="Modify which villagers are currently on your island. These will be excluded from bingo cards."
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <DeleteIcon color="error" />
                </ListItemIcon>
                <ListItemText
                  primary="Abandon Hunt"
                  secondary="Permanently end this hunt. This action cannot be undone."
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <DeleteIcon color="error" />
                </ListItemIcon>
                <ListItemText
                  primary="Delete Hunt"
                  secondary="Permanently delete this hunt. This action cannot be undone and the hunt will not appear in history."
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <PauseIcon color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary="Pause Hunt"
                  secondary="Temporarily pause the hunt. You can resume it later."
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <AddIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Complete Hunt"
                  secondary="Mark the hunt as completed. This ends the hunt successfully."
                />
              </ListItem>
            </>
          )}
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Encounters Table
        </Typography>

        <List>
          {(isModerator || initialIsOwner) && (
            <>
              <ListItem>
                <ListItemIcon>
                  <AddIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Add Encounter"
                  secondary="Log a new villager encounter. Select the villager and island number"
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <RemoveIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Update / Delete Encounter"
                  secondary="Update or delete an existing counter"
                />
              </ListItem>
            </>
          )}

          <ListItem>
            <ListItemIcon>
              <SearchIcon color="action" />
            </ListItemIcon>
            <ListItemText
              primary="Search & Filter"
              secondary="Click the filter icon next to 'Villager' to show a search box and find specific villagers by name."
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <SortIcon color="action" />
            </ListItemIcon>
            <ListItemText
              primary="Sort Columns"
              secondary="Click column headers to sort by island number, date, villager name, or status."
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2" color="text.secondary">
          <strong>Pro Tips:</strong><br/>
          • Bingo cards are generated randomly each time<br/>
          • Island villagers are automatically excluded from bingo cards<br/>
          • All timestamps are in your local timezone<br/>
          • Moderators can add encounters but cannot modify hunt settings
        </Typography>
      </Drawer>

      {/* Modals */}
      <UpdateIslandVillagersModal
        open={updateIslandModalOpen}
        onClose={() => setUpdateIslandModalOpen(false)}
        huntId={hunt?.hunt_id || ''}
        currentIslandVillagers={hunt?.island_villagers || []}
        currentHotelTourists={hunt?.hotel_tourists || []}
        villagers={villagers}
        allVillagers={allVillagers}
        onUpdated={fetchHuntData}
      />
      <BingoCardDrawer
        open={bingoCardDrawerOpen}
        onClose={() => setBingoCardDrawerOpen(false)}
        onGenerate={handleGenerateBingoCard}
        onGenerateCustom={handleGenerateCustomBingoCard}
        onClear={bingoCard.clearCard}
        cardData={bingoCard.cardData}
        villagers={allVillagers}
        onSquareClick={bingoCard.toggleSquare}
        loading={generatingBingo}
        targetVillagers={targetVillagers}
        islandVillagers={hunt?.island_villagers || []}
        hotelTourists={hunt?.hotel_tourists || []}
        bingoCardSize={hunt?.bingo_card_size || 5}
        username={initialUsername}
        huntName={hunt?.hunt_name || 'unknown'}
        onRestoreCard={bingoCard.restoreCard}
      />
      <HuntStatisticsModal
        open={huntStatsModalOpen}
        onClose={() => setHuntStatsModalOpen(false)}
        huntId={hunt?.hunt_id || ''}
      />

      <HuntSettingsModal
        open={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        hunt={hunt}
        isOwner={initialIsOwner}
        isModerator={isModerator}
        isTempMod={isTempMod}
        overlayUrl={overlayUrl}
        onUpdateTargetOpen={() => {
          setUpdateTargetModalOpen(true);
          setSettingsModalOpen(false);
        }}
        onUpdateIslandOpen={() => {
          setUpdateIslandModalOpen(true);
          setSettingsModalOpen(false);
        }}
        onBingoSettingsOpen={() => setBingoSettingsModalOpen(true)}
        onTempModsOpen={() => {
          setTempModsModalOpen(true);
          setSettingsModalOpen(false);
        }}
        onDeleteOpen={() => {
          setDeleteModalOpen(true);
          setSettingsModalOpen(false);
        }}
      />

      {/* Temp Mods Modal */}
      <Dialog open={tempModsModalOpen} onClose={() => setTempModsModalOpen(false)} sx={{ '& .MuiDialog-paper': { minWidth: '600px' } }}>
        <DialogTitle>Temp Mods</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Temp mods can only update the villager hunt tracker. This will not add them as a mod in your Twitch channel.
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Button variant="contained" onClick={() => { setAddTempModModalOpen(true); setTempModsModalOpen(false); }}>
              Add Temp Mod
            </Button>
          </Box>
          <TempModsTable key={tempModsModalOpen ? 'open' : 'closed'} creatorTwitchId={initialTwitchId} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTempModsModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Temp Mod Modal */}
      <AddTempModModal
        open={addTempModModalOpen}
        onClose={() => setAddTempModModalOpen(false)}
        onSuccess={() => {
          setAddTempModModalOpen(false);
          setTempModsModalOpen(true);
          // The table will refresh automatically due to the useEffect
        }}
        creatorTwitchId={initialTwitchId}
      />

      <BingoCardControlModal
        open={bingoSettingsModalOpen}
        onClose={() => setBingoSettingsModalOpen(false)}
        isBingoEnabled={isBingoEnabled}
        bingoCardSize={bingoCardSize}
        onSave={async (enabled, size) => {
          setIsBingoEnabled(enabled);
          setBingoCardSize(size);
          try {
            const res = await fetch('/api/hunts/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ hunt_id: hunt?.hunt_id, is_bingo_enabled: enabled, bingo_card_size: size }),
            });
            if (!res.ok) {
              throw new Error('Failed to update');
            }
            // Refetch to update hunt data
            fetchHuntData();
          } catch (error) {
            console.error('Failed to update bingo settings:', error);
            // Revert on error
            setIsBingoEnabled(!enabled);
            setBingoCardSize(hunt?.bingo_card_size ?? 5);
          }
        }}
      />

      <ConfirmDeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          if (!hunt) return;
          const form = document.createElement('form');
          form.method = 'post';
          form.action = '/api/hunts/delete';
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'hunt_id';
          input.value = hunt.hunt_id;
          form.appendChild(input);
          document.body.appendChild(form);
          form.submit();
        }}
      />

      <DreamieFoundModal
        open={dreamieModalOpen}
        onClose={() => setDreamieModalOpen(false)}
        huntId={hunt?.hunt_id || ''}
        onComplete={() => {
          if (!hunt) return;
          const form = document.createElement('form');
          form.method = 'post';
          form.action = '/api/hunts/complete';
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'hunt_id';
          input.value = hunt.hunt_id;
          form.appendChild(input);
          document.body.appendChild(form);
          form.submit();
        }}
      />

      <InactiveHuntNotification 
        isVisible={showInactiveNotification} 
        onClose={() => setShowInactiveNotification(false)} 
      />

      <PublicPrivateToggleModal
        open={publicToggleModalOpen}
        onClose={() => {
          setPublicToggleModalOpen(false);
          setPendingPublicValue(null);
        }}
        onConfirm={handleConfirmPublicToggle}
        isTogglingToPublic={pendingPublicValue ?? false}
      />

    </Container>
  );
}