'use client';

import * as React from 'react';
import { Box, Button, Container, Stack, Typography, Drawer, IconButton, Divider, List, ListItem, ListItemText, ListItemIcon, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Link from 'next/link';
import HelpIcon from '@mui/icons-material/Help';
import CloseIcon from '@mui/icons-material/Close';
import CasinoIcon from '@mui/icons-material/Casino';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PauseIcon from '@mui/icons-material/Pause';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove'
import SortIcon from '@mui/icons-material/Sort';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import OwnerHuntControls from '@/components/villagerhunt/OwnerHuntControls';
import EncountersTable from '@/components/villagerhunt/EncountersTable';
import AuthLink from '@/components/villagerhunt/AuthLink';
import { generateBingoCard } from '@/utils/bingoCardGenerator';
import UpdateIslandVillagersModal from '@/components/villagerhunt/UpdateIslandVillagersModal';
import UpdateTargetVillagersModal from '@/components/villagerhunt/UpdateTargetVillagersModal';
import BingoCardModal from '@/components/villagerhunt/BingoCardModal';
import HuntStatisticsModal from '@/components/villagerhunt/HuntStatisticsModal';
import { createClient } from '@/utils/supabase/client';

type Hunt = {
  hunt_id: string;
  hunt_name: string;
  target_villager_id: number[];
  island_villagers: number[];
};

type Villager = {
  villager_id: number;
  name: string;
  image_url: string | null;
};

type Session = {
  login: string;
  userId: string;
  accessToken?: string;
};

type Props = {
  initialDisplayName: string;
  initialTwitchId: number;
  initialSession: Session | null;
  initialIsOwner: boolean;
  initialIsModerator: boolean;
  initialUsername: string;
};

export default function HuntPageWrapper({
  initialDisplayName,
  initialTwitchId,
  initialSession,
  initialIsOwner,
  initialIsModerator,
  initialUsername,
}: Props) {
  const [hunt, setHunt] = React.useState<Hunt | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [villagers, setVillagers] = React.useState<Villager[]>([]);
  const [generatingBingo, setGeneratingBingo] = React.useState(false);
  const [updateIslandModalOpen, setUpdateIslandModalOpen] = React.useState(false);
  const [updateTargetModalOpen, setUpdateTargetModalOpen] = React.useState(false);
  const [bingoCardModalOpen, setBingoCardModalOpen] = React.useState(false);
  const [bingoCardImage, setBingoCardImage] = React.useState<string | null>(null);
  const [instructionsDrawerOpen, setInstructionsDrawerOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<string>('');
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [huntStatsModalOpen, setHuntStatsModalOpen] = React.useState(false);
  const [isModerator, setIsModerator] = React.useState(initialIsModerator);
  const [settingsModalOpen, setSettingsModalOpen] = React.useState(false);

  // Fetch hunt data
  const fetchHuntData = React.useCallback(async () => {
    const supabase = createClient();

    try {
      // Fetch ACTIVE hunt
      const { data: huntData, error: huntError } = await supabase
        .from('hunts')
        .select('hunt_id, hunt_name, target_villager_id, island_villagers')
        .eq('twitch_id', initialTwitchId)
        .eq('hunt_status', 'ACTIVE')
        .order('hunt_id', { ascending: false })
        .maybeSingle();

      if (!huntError) {
        setHunt(huntData);
      }

      // Fetch villagers for encounter lookup
      const { data: villagersData } = await supabase
        .from('villagers')
        .select('villager_id, name, image_url');

      // Exclude villagers that require additional purchases (not part of base game)
      const excludedVillagerIds = [627, 573, 571, 731, 811, 876];
      const filteredVillagers = (villagersData || []).filter(villager => !excludedVillagerIds.includes(villager.villager_id));

      setVillagers(filteredVillagers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching hunt data:', error);
      // If 401, perhaps set a flag to show login
      if (error instanceof Error && error.message.includes('401')) {
        // Handle auth error, e.g., redirect to login
        window.location.href = '/auth'; // or show a login button
      }
      setLoading(false);
    }
  }, [initialTwitchId]);

  // Initial fetch
  React.useEffect(() => {
    fetchHuntData();
  }, [fetchHuntData]);

  // Check moderator status client-side
  React.useEffect(() => {
    if (initialIsOwner || !initialSession) return;
    fetch(`/api/moderator/${initialTwitchId}`)
      .then(res => res.json())
      .then(data => setIsModerator(data.isModerator))
      .catch(() => setIsModerator(false));
  }, [initialIsOwner, initialSession, initialTwitchId]);

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
  const handleGenerateBingoCard = async () => {
    if (!hunt) return;

    setGeneratingBingo(true);
    setBingoCardImage(null); // Clear previous image
    setBingoCardModalOpen(true);

    try {
      const imageDataUrl = await generateBingoCard({
        huntId: hunt.hunt_id,
        huntName: hunt.hunt_name,
        creatorName: initialDisplayName,
        targetVillagers: targetVillagers,
        islandVillagers: hunt.island_villagers,
        villagers,
      });

      setBingoCardImage(imageDataUrl);
    } catch (error) {
      console.error('Failed to generate bingo card:', error);
      setBingoCardImage(null);
    } finally {
      setGeneratingBingo(false);
    }
  };

  // Handle hunt statistics modal
  const handleHuntStats = () => {
    setHuntStatsModalOpen(true);
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
    const islandVillagersFiltered = villagers.filter(v => hunt.island_villagers.includes(v.villager_id));
    setIslandVillagersData(islandVillagersFiltered);
  }, [hunt?.island_villagers, villagers]);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!hunt) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Typography variant="h4" fontWeight={700}>{initialDisplayName}</Typography>
          <Typography variant="h6" color="text.secondary">No active hunt</Typography>
          <Link href={`/villagerhunt/${encodeURIComponent(initialUsername)}/history`} style={{ color: 'inherit', textDecoration: 'underline' }}>
            View Hunt History
          </Link>
        </Stack>
        {initialIsOwner && <OwnerHuntControls showStart onHuntCreated={fetchHuntData} />}
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 } }}>
      {/* Help Button for authenticated owners/moderators */}
      {(initialIsOwner || isModerator) && initialSession && (
        <Box sx={{ position: 'fixed', top: 20, right: 20, zIndex: 1000 }}>
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
      <Stack spacing={0.5} sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h4" component="h1" fontWeight={700}>{initialDisplayName}</Typography>
          {initialIsOwner && <IconButton onClick={() => setSettingsModalOpen(true)}><SettingsIcon /></IconButton>}
        </Box>
        {!initialSession && <AuthLink username={initialDisplayName} />}
        <Typography variant="h6" component="h2" color="text.secondary">{hunt.hunt_name}</Typography>
        <Link href={`/villagerhunt/${encodeURIComponent(initialUsername)}/history`} style={{ color: 'inherit', textDecoration: 'underline' }}>
          View Hunt History
        </Link>
        {targetVillagers.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">Dreamie List:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {targetVillagers.map((villager) => (
                <Box key={villager.villager_id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    component="img"
                    src={villager.image_url || undefined}
                    alt={villager.name}
                    sx={{ maxWidth: 60, maxHeight: 60, borderRadius: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">{villager.name}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
        {islandVillagersData.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">Current Island Villagers:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {islandVillagersData.map((villager) => (
                <Box key={villager.villager_id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    component="img"
                    src={villager.image_url || undefined}
                    alt={villager.name}
                    sx={{ maxWidth: 60, maxHeight: 60, borderRadius: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">{villager.name}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Stack>

      
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateBingoCard}
            disabled={generatingBingo}
          >
            {generatingBingo ? 'Generating...' : 'Generate Bingo Card'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleHuntStats}
          >
            {'Hunt Statistics'}
          </Button>
        </Box>


      <EncountersTable villagers={villagers} isOwner={initialIsOwner} isModerator={isModerator} huntId={hunt.hunt_id} targetVillagerIds={hunt.target_villager_id} />

      <UpdateIslandVillagersModal
        open={updateIslandModalOpen}
        onClose={() => setUpdateIslandModalOpen(false)}
        huntId={hunt.hunt_id}
        currentIslandVillagers={hunt.island_villagers}
        villagers={villagers}
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

      <BingoCardModal
        open={bingoCardModalOpen}
        onClose={() => setBingoCardModalOpen(false)}
        onRegenerate={handleGenerateBingoCard}
        bingoCardImage={bingoCardImage}
        loading={generatingBingo}
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
              primary="Generate Bingo Card"
              secondary="Creates a bingo card for your community to play along. Automatically excludes your dreamies and island villagers."
            />
          </ListItem>
          
          {initialIsOwner && (
            <>
              <ListItem>
                <ListItemIcon>
                  <EditIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Update Island Villagers"
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
        villagers={villagers}
        onUpdated={fetchHuntData}
      />
      <BingoCardModal
        open={bingoCardModalOpen}
        onClose={() => setBingoCardModalOpen(false)}
        bingoCardImage={bingoCardImage}
        loading={generatingBingo}
      />
      <HuntStatisticsModal
        open={huntStatsModalOpen}
        onClose={() => setHuntStatsModalOpen(false)}
        huntId={hunt?.hunt_id || ''}
      />

      <Dialog open={settingsModalOpen} onClose={() => setSettingsModalOpen(false)}>
        <DialogTitle>Hunt Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Button variant="outlined" onClick={() => { setUpdateTargetModalOpen(true); setSettingsModalOpen(false); }}>Update Dreamies</Button>
            <Button variant="outlined" onClick={() => { setUpdateIslandModalOpen(true); setSettingsModalOpen(false); }}>Update Island Villagers</Button>
            <FormControl variant="outlined" size="small">
              <InputLabel>Update Hunt Status</InputLabel>
              <Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} label="Change Status">
                <MenuItem value="complete">Completed</MenuItem>
                <MenuItem value="pause">Paused</MenuItem>
                <MenuItem value="abandon">Abandoned</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" color="primary" onClick={() => { if (!selectedStatus) return; const form = document.createElement('form'); form.method = 'post'; form.action = `/api/hunts/${selectedStatus}`; const input = document.createElement('input'); input.type = 'hidden'; input.name = 'hunt_id'; input.value = hunt.hunt_id; form.appendChild(input); document.body.appendChild(form); form.submit(); }} disabled={!selectedStatus}>Change Status</Button>
            <Button variant="contained" color="error" size="large" onClick={() => { setDeleteModalOpen(true); setSettingsModalOpen(false); }} sx={{ fontWeight: 'bold' }}>Delete Hunt</Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}