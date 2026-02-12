'use client';

import * as React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Button,
  Collapse,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import Link from 'next/link';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Grid from '@mui/material/Grid2';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { createClient } from '@/utils/supabase/client';
import VillagerDisplay from '@/components/villagerhunt/displays/VillagerDisplay';
import { useTableSort } from '@/components/villagerhunt/hooks';
import type { VillagerDetailed } from '@/types/villagerhunt';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

type Villager = VillagerDetailed;

type HuntStat = {
  hunt_id: string;
  twitch_id: string;
  username: string;
  encounter_count: number;
  status: string;
};

type VillagerEncounterStat = {
  villager: Villager;
  count: number;
};

type ChartData = {
  name: string;
  value: number;
};

export default function GlobalStatsPage() {
  const [loading, setLoading] = React.useState(true);
  const [longestActiveHunt, setLongestActiveHunt] = React.useState<HuntStat | null>(null);
  const [longestCompletedHunt, setLongestCompletedHunt] = React.useState<HuntStat | null>(null);
  const [topActiveHunts, setTopActiveHunts] = React.useState<HuntStat[]>([]);
  const [topCompletedHunts, setTopCompletedHunts] = React.useState<HuntStat[]>([]);
  const [activeHuntsExpanded, setActiveHuntsExpanded] = React.useState(false);
  const [completedHuntsExpanded, setCompletedHuntsExpanded] = React.useState(false);
  const [mostEncounteredVillager, setMostEncounteredVillager] = React.useState<VillagerEncounterStat | null>(null);
  const [leastEncounteredVillager, setLeastEncounteredVillager] = React.useState<VillagerEncounterStat | null>(null);
  const [topEncounteredVillagers, setTopEncounteredVillagers] = React.useState<VillagerEncounterStat[]>([]);
  const [leastEncounteredVillagers, setLeastEncounteredVillagers] = React.useState<VillagerEncounterStat[]>([]);
  const [mostEncounteredExpanded, setMostEncounteredExpanded] = React.useState(false);
  const [leastEncounteredExpanded, setLeastEncounteredExpanded] = React.useState(false);
  const [dreamiesExpanded, setDreamiesExpanded] = React.useState(false);
  const [topDreamies, setTopDreamies] = React.useState<VillagerEncounterStat[]>([]);
  const [speciesData, setSpeciesData] = React.useState<ChartData[]>([]);
  const [personalityData, setPersonalityData] = React.useState<ChartData[]>([]);
  const [signData, setSignData] = React.useState<ChartData[]>([]);
  const [totalEncounters, setTotalEncounters] = React.useState(0);
  const [totalPublicCreators, setTotalPublicCreators] = React.useState(0);
  const [totalHunts, setTotalHunts] = React.useState(0);

  const fetchGlobalStatistics = React.useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Try to fetch from materialized view first
      const { data: cachedStats, error: cacheError } = await supabase
        .from('global_hunt_stats')
        .select('*')
        .single();

      if (!cacheError && cachedStats) {
        // Use cached statistics
        setTotalPublicCreators(cachedStats.total_public_creators || 0);
        setTotalHunts(cachedStats.total_hunts || 0);
        setTotalEncounters(cachedStats.total_encounters || 0);

        // Set longest hunts
        if (cachedStats.longest_active_hunt) {
          setLongestActiveHunt({
            hunt_id: cachedStats.longest_active_hunt.hunt_id,
            twitch_id: cachedStats.longest_active_hunt.twitch_id,
            username: cachedStats.longest_active_hunt.username,
            encounter_count: cachedStats.longest_active_hunt.encounter_count,
            status: 'ACTIVE',
          });
        }

        if (cachedStats.longest_completed_hunt) {
          setLongestCompletedHunt({
            hunt_id: cachedStats.longest_completed_hunt.hunt_id,
            twitch_id: cachedStats.longest_completed_hunt.twitch_id,
            username: cachedStats.longest_completed_hunt.username,
            encounter_count: cachedStats.longest_completed_hunt.encounter_count,
            status: 'COMPLETED',
          });
        }

        // Fetch villager details for most/least encountered and dreamies
        const villagerIds = new Set<number>();
        
        if (cachedStats.most_encountered_villager) {
          villagerIds.add(cachedStats.most_encountered_villager.villager_id);
        }
        
        if (cachedStats.least_encountered_villager) {
          villagerIds.add(cachedStats.least_encountered_villager.villager_id);
        }

        if (cachedStats.top_dreamies && Array.isArray(cachedStats.top_dreamies)) {
          cachedStats.top_dreamies.forEach((d: { villager_id: number; count: number }) => villagerIds.add(d.villager_id));
        }

        // Get all villager IDs from encounter counts for trait distributions
        const villagerEncounterCounts = cachedStats.villager_encounter_counts || {};
        Object.keys(villagerEncounterCounts).forEach(id => villagerIds.add(parseInt(id)));

        // Fetch villager details in batches
        const allVillagerIds = Array.from(villagerIds);
        let allVillagers: Villager[] = [];
        const BATCH_SIZE = 100;
        
        for (let i = 0; i < allVillagerIds.length; i += BATCH_SIZE) {
          const batchIds = allVillagerIds.slice(i, i + BATCH_SIZE);
          const { data: batchVillagers } = await supabase
            .from('villagers')
            .select('villager_id, name, species, personality, sign, image_url, amiibo_only')
            .in('villager_id', batchIds)
            .order('name');

          if (batchVillagers) {
            allVillagers = allVillagers.concat(batchVillagers);
          }
        }

        // Create villager lookup
        const villagerMap = new Map(allVillagers.map(v => [v.villager_id, v]));

        // Set most/least encountered villagers
        if (cachedStats.most_encountered_villager) {
          const villager = villagerMap.get(cachedStats.most_encountered_villager.villager_id);
          if (villager) {
            setMostEncounteredVillager({
              villager,
              count: cachedStats.most_encountered_villager.count,
            });
          }
        }

        if (cachedStats.least_encountered_villager) {
          const villager = villagerMap.get(cachedStats.least_encountered_villager.villager_id);
          if (villager) {
            setLeastEncounteredVillager({
              villager,
              count: cachedStats.least_encountered_villager.count,
            });
          }
        }

        // Set top dreamies
        if (cachedStats.top_dreamies && Array.isArray(cachedStats.top_dreamies)) {
          const dreamieStats = cachedStats.top_dreamies
            .map((d: { villager_id: number; count: number }) => {
              const villager = villagerMap.get(d.villager_id);
              return villager ? { villager, count: d.count } : null;
            })
            .filter((d: VillagerEncounterStat | null): d is VillagerEncounterStat => d !== null);
          
          setTopDreamies(dreamieStats);
        }

        // Build trait distributions
        const speciesCounts: Record<string, number> = {};
        const personalityCounts: Record<string, number> = {};
        const signCounts: Record<string, number> = {};

        allVillagers.forEach(villager => {
          const count = villagerEncounterCounts[villager.villager_id] || 0;
          
          if (villager.species) {
            speciesCounts[villager.species] = (speciesCounts[villager.species] || 0) + count;
          }
          
          if (villager.personality) {
            personalityCounts[villager.personality] = (personalityCounts[villager.personality] || 0) + count;
          }
          
          if (villager.sign) {
            signCounts[villager.sign] = (signCounts[villager.sign] || 0) + count;
          }
        });

        setSpeciesData(
          Object.entries(speciesCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
        );

        setPersonalityData(
          Object.entries(personalityCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
        );

        setSignData(
          Object.entries(signCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
        );

        // Set top active hunts (skip the first one since it's already the longest)
        if (cachedStats.top_active_hunts && Array.isArray(cachedStats.top_active_hunts)) {
          setTopActiveHunts(cachedStats.top_active_hunts.slice(1, 10));
        }

        // Set top completed hunts (skip the first one since it's already the longest)
        if (cachedStats.top_completed_hunts && Array.isArray(cachedStats.top_completed_hunts)) {
          setTopCompletedHunts(cachedStats.top_completed_hunts.slice(1, 10));
        }

        // Set top encountered villagers (skip the first one since it's already shown)
        if (cachedStats.top_encountered_villagers && Array.isArray(cachedStats.top_encountered_villagers)) {
          const topEncountered = cachedStats.top_encountered_villagers.slice(1, 10)
            .map((d: { villager_id: number; count: number }) => {
              const villager = villagerMap.get(d.villager_id);
              return villager ? { villager, count: d.count } : null;
            })
            .filter((d: VillagerEncounterStat | null): d is VillagerEncounterStat => d !== null);
          setTopEncounteredVillagers(topEncountered);
        }

        // Set least encountered villagers (skip the first one since it's already shown)
        if (cachedStats.least_encountered_villagers && Array.isArray(cachedStats.least_encountered_villagers)) {
          const leastEncountered = cachedStats.least_encountered_villagers.slice(1, 10)
            .map((d: { villager_id: number; count: number }) => {
              const villager = villagerMap.get(d.villager_id);
              return villager ? { villager, count: d.count } : null;
            })
            .filter((d: VillagerEncounterStat | null): d is VillagerEncounterStat => d !== null);
          setLeastEncounteredVillagers(leastEncountered);
        }

        setLoading(false);
        return;
      }

      // Materialized view not available
      console.error('Materialized view not found:', cacheError);
      setLoading(false);

    } catch (error) {
      console.error('Error fetching global statistics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchGlobalStatistics();
  }, [fetchGlobalStatistics]);

  // Sorting for trait distributions
  const speciesSort = useTableSort(speciesData);
  const personalitySort = useTableSort(personalityData);
  const signSort = useTableSort(signData);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Global Villager Hunt Statistics
      </Typography>
      <Box sx={{ mb: 3 }}>
        <Button component={Link} href="/villagerhunt" variant="outlined" startIcon={<HomeIcon />}>
          Home
        </Button>
      </Box>
      <Typography variant="body1" color="text.secondary" paragraph>
        Statistics across all public creators and their villager hunts.
        This data is refreshed twice daily around 9AM and 9PM Eastern.
        If you would like to have your data included, please set your visibilty to public in your settings.
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* Overview Stats */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Overview
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="primary">
                  {totalPublicCreators}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Public Creators
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="secondary">
                  {totalHunts}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Hunts
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="success.main">
                  {totalEncounters}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Encounters
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="info.main">
                  {totalEncounters > 0 ? (totalEncounters / totalHunts).toFixed(1) : 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Encounters/Hunt
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Best/Top Statistics */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Top Records
        </Typography>
        <Grid container spacing={3}>
          {/* Longest Active Hunt */}
          <Grid size={{ xs: 12, md: 6 }}>
            {longestActiveHunt ? (
              <Paper sx={{ overflow: 'hidden' }}>
                <Link 
                  href={`/villagerhunt/${encodeURIComponent(longestActiveHunt.username)}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Box
                    sx={{ 
                      p: 3,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      }
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Longest Active Hunt
                    </Typography>
                    <Box>
                      <Typography variant="h3" color="primary">
                        {longestActiveHunt.encounter_count} encounters
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        by {longestActiveHunt.username}
                      </Typography>
                    </Box>
                  </Box>
                </Link>
                {topActiveHunts.length > 0 && (
                  <>
                    <Divider />
                    <Box 
                      onClick={() => setActiveHuntsExpanded(!activeHuntsExpanded)}
                      sx={{ 
                        px: 3, 
                        py: 1, 
                        display: 'flex', 
                        justifyContent: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <Button
                        endIcon={
                          <ExpandMoreIcon
                            sx={{
                              transform: activeHuntsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: '0.3s',
                            }}
                          />
                        }
                        size="small"
                        sx={{ pointerEvents: 'none' }}
                      >
                        {activeHuntsExpanded ? 'Hide' : 'Show'} Top 10
                      </Button>
                    </Box>
                    <Collapse in={activeHuntsExpanded} timeout="auto" unmountOnExit>
                      <Divider />
                      <List dense>
                        {topActiveHunts.map((hunt, index) => (
                          <ListItem
                            key={hunt.hunt_id}
                            component={Link}
                            href={`/villagerhunt/${encodeURIComponent(hunt.username)}`}
                            sx={{
                              textDecoration: 'none',
                              color: 'inherit',
                              '&:hover': {
                                backgroundColor: 'action.hover',
                              },
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="body2">
                                    #{index + 2}. {hunt.username}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {hunt.encounter_count} encounters
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </>
                )}
              </Paper>
            ) : (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Longest Active Hunt
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No active hunts found
                </Typography>
              </Paper>
            )}
          </Grid>

          {/* Longest Completed Hunt */}
          <Grid size={{ xs: 12, md: 6 }}>
            {longestCompletedHunt ? (
              <Paper sx={{ overflow: 'hidden' }}>
                <Link 
                  href={`/villagerhunt/${encodeURIComponent(longestCompletedHunt.username)}/history/${longestCompletedHunt.hunt_id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Box
                    sx={{ 
                      p: 3,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      }
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Longest Completed Hunt
                    </Typography>
                    <Box>
                      <Typography variant="h3" color="secondary">
                        {longestCompletedHunt.encounter_count} encounters
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        by {longestCompletedHunt.username}
                      </Typography>
                    </Box>
                  </Box>
                </Link>
                {topCompletedHunts.length > 0 && (
                  <>
                    <Divider />
                    <Box 
                      onClick={() => setCompletedHuntsExpanded(!completedHuntsExpanded)}
                      sx={{ 
                        px: 3, 
                        py: 1, 
                        display: 'flex', 
                        justifyContent: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <Button
                        endIcon={
                          <ExpandMoreIcon
                            sx={{
                              transform: completedHuntsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: '0.3s',
                            }}
                          />
                        }
                        size="small"
                        sx={{ pointerEvents: 'none' }}
                      >
                        {completedHuntsExpanded ? 'Hide' : 'Show'} Top 10
                      </Button>
                    </Box>
                    <Collapse in={completedHuntsExpanded} timeout="auto" unmountOnExit>
                      <Divider />
                      <List dense>
                        {topCompletedHunts.map((hunt, index) => (
                          <ListItem
                            key={hunt.hunt_id}
                            component={Link}
                            href={`/villagerhunt/${encodeURIComponent(hunt.username)}/history/${hunt.hunt_id}`}
                            sx={{
                              textDecoration: 'none',
                              color: 'inherit',
                              '&:hover': {
                                backgroundColor: 'action.hover',
                              },
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="body2">
                                    #{index + 2}. {hunt.username}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {hunt.encounter_count} encounters
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </>
                )}
              </Paper>
            ) : (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Longest Completed Hunt
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No completed hunts found
                </Typography>
              </Paper>
            )}
          </Grid>

          {/* Most Encountered Villager */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ overflow: 'hidden' }}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Most Encountered Villager
                </Typography>
                {mostEncounteredVillager ? (
                  <Box>
                    <VillagerDisplay 
                      villager={mostEncounteredVillager.villager} 
                      variant="avatar" 
                      avatarSize={80} 
                    />
                    <Typography variant="h4" color="success.main" sx={{ mt: 2 }}>
                      {mostEncounteredVillager.count} encounters
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No data available
                  </Typography>
                )}
              </Box>
              {topEncounteredVillagers.length > 0 && (
                <>
                  <Divider />
                  <Box 
                    onClick={() => setMostEncounteredExpanded(!mostEncounteredExpanded)}
                    sx={{ 
                      px: 3, 
                      py: 1, 
                      display: 'flex', 
                      justifyContent: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <Button
                      endIcon={
                        <ExpandMoreIcon
                          sx={{
                            transform: mostEncounteredExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: '0.3s',
                          }}
                        />
                      }
                      size="small"
                      sx={{ pointerEvents: 'none' }}
                    >
                      {mostEncounteredExpanded ? 'Hide' : 'Show'} Top 10
                    </Button>
                  </Box>
                  <Collapse in={mostEncounteredExpanded} timeout="auto" unmountOnExit>
                    <Divider />
                    <List dense>
                      {topEncounteredVillagers.map((stat, index) => (
                        <ListItem
                          key={stat.villager.villager_id}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            },
                          }}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2">
                                    #{index + 2}.
                                  </Typography>
                                  <VillagerDisplay 
                                    villager={stat.villager} 
                                    variant="avatar" 
                                    avatarSize={40} 
                                  />
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                  {stat.count} encounters
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </>
              )}
            </Paper>
          </Grid>

          {/* Least Encountered Villager */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ overflow: 'hidden' }}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Least Encountered Villager
                </Typography>
                {leastEncounteredVillager ? (
                  <Box>
                    <VillagerDisplay 
                      villager={leastEncounteredVillager.villager} 
                      variant="avatar" 
                      avatarSize={80} 
                    />
                    <Typography variant="h4" color="warning.main" sx={{ mt: 2 }}>
                      {leastEncounteredVillager.count} {leastEncounteredVillager.count === 1 ? 'encounter' : 'encounters'}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No data available
                  </Typography>
                )}
              </Box>
              {leastEncounteredVillagers.length > 0 && (
                <>
                  <Divider />
                  <Box 
                    onClick={() => setLeastEncounteredExpanded(!leastEncounteredExpanded)}
                    sx={{ 
                      px: 3, 
                      py: 1, 
                      display: 'flex', 
                      justifyContent: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <Button
                      endIcon={
                        <ExpandMoreIcon
                          sx={{
                            transform: leastEncounteredExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: '0.3s',
                          }}
                        />
                      }
                      size="small"
                      sx={{ pointerEvents: 'none' }}
                    >
                      {leastEncounteredExpanded ? 'Hide' : 'Show'} Top 10
                    </Button>
                  </Box>
                  <Collapse in={leastEncounteredExpanded} timeout="auto" unmountOnExit>
                    <Divider />
                    <List dense>
                      {leastEncounteredVillagers.map((stat, index) => (
                        <ListItem
                          key={stat.villager.villager_id}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            },
                          }}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2">
                                    #{index + 2}.
                                  </Typography>
                                  <VillagerDisplay 
                                    villager={stat.villager} 
                                    variant="avatar" 
                                    avatarSize={40} 
                                  />
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                  {stat.count} {stat.count === 1 ? 'encounter' : 'encounters'}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Most Desired Dreamies */}
      {topDreamies.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Most Desired Dreamies
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>Villager</TableCell>
                  <TableCell align="right">Times Selected as Dreamie</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topDreamies.slice(0, 5).map((stat, index) => (
                  <TableRow key={stat.villager.villager_id}>
                    <TableCell>
                      <Typography variant="h6">#{index + 1}</Typography>
                    </TableCell>
                    <TableCell>
                      <VillagerDisplay 
                        villager={stat.villager} 
                        variant="avatar" 
                        avatarSize={50} 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6">{stat.count}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
                {topDreamies.length > 5 && (
                  <>
                    <TableRow>
                      <TableCell colSpan={3} sx={{ p: 0, border: 0 }}>
                        <Divider />
                        <Box 
                          onClick={() => setDreamiesExpanded(!dreamiesExpanded)}
                          sx={{ 
                            px: 3, 
                            py: 1, 
                            display: 'flex', 
                            justifyContent: 'center',
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            },
                          }}
                        >
                          <Button
                            endIcon={
                              <ExpandMoreIcon
                                sx={{
                                  transform: dreamiesExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                  transition: '0.3s',
                                }}
                              />
                            }
                            size="small"
                            sx={{ pointerEvents: 'none' }}
                          >
                            {dreamiesExpanded ? 'Hide' : 'Show'} Next {topDreamies.length - 5}
                          </Button>
                        </Box>
                        <Collapse in={dreamiesExpanded} timeout="auto" unmountOnExit>
                          <Divider />
                        </Collapse>
                      </TableCell>
                    </TableRow>
                    {dreamiesExpanded && topDreamies.slice(5).map((stat, index) => (
                      <TableRow key={stat.villager.villager_id}>
                        <TableCell>
                          <Typography variant="h6">#{index + 6}</Typography>
                        </TableCell>
                        <TableCell>
                          <VillagerDisplay 
                            villager={stat.villager} 
                            variant="avatar" 
                            avatarSize={50} 
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6">{stat.count}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Trait Distributions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Encounter Distribution by Traits
        </Typography>

        {/* Species Distribution */}
        {speciesData.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Species Distribution
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 2, height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={speciesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.name}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {speciesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <TableSortLabel
                            active={speciesSort.sortConfig.field === 'name'}
                            direction={speciesSort.sortConfig.field === 'name' ? speciesSort.sortConfig.direction : 'asc'}
                            onClick={() => speciesSort.handleSort('name')}
                          >
                            Species
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right">
                          <TableSortLabel
                            active={speciesSort.sortConfig.field === 'value'}
                            direction={speciesSort.sortConfig.field === 'value' ? speciesSort.sortConfig.direction : 'asc'}
                            onClick={() => speciesSort.handleSort('value')}
                          >
                            Encounters
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right">Percentage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {speciesSort.sortedData.map((row) => {
                        const total = speciesData.reduce((sum, item) => sum + item.value, 0);
                        const percentage = total > 0 ? ((row.value / total) * 100).toFixed(1) : '0';
                        return (
                          <TableRow key={row.name}>
                            <TableCell>{row.name}</TableCell>
                            <TableCell align="right">{row.value}</TableCell>
                            <TableCell align="right">{percentage}%</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Personality Distribution */}
        {personalityData.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Personality Distribution
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 2, height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={personalityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.name}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {personalityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <TableSortLabel
                            active={personalitySort.sortConfig.field === 'name'}
                            direction={personalitySort.sortConfig.field === 'name' ? personalitySort.sortConfig.direction : 'asc'}
                            onClick={() => personalitySort.handleSort('name')}
                          >
                            Personality
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right">
                          <TableSortLabel
                            active={personalitySort.sortConfig.field === 'value'}
                            direction={personalitySort.sortConfig.field === 'value' ? personalitySort.sortConfig.direction : 'asc'}
                            onClick={() => personalitySort.handleSort('value')}
                          >
                            Encounters
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right">Percentage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {personalitySort.sortedData.map((row) => {
                        const total = personalityData.reduce((sum, item) => sum + item.value, 0);
                        const percentage = total > 0 ? ((row.value / total) * 100).toFixed(1) : '0';
                        return (
                          <TableRow key={row.name}>
                            <TableCell>{row.name}</TableCell>
                            <TableCell align="right">{row.value}</TableCell>
                            <TableCell align="right">{percentage}%</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Sign Distribution */}
        {signData.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Zodiac Sign Distribution
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 2, height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={signData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.name}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {signData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <TableSortLabel
                            active={signSort.sortConfig.field === 'name'}
                            direction={signSort.sortConfig.field === 'name' ? signSort.sortConfig.direction : 'asc'}
                            onClick={() => signSort.handleSort('name')}
                          >
                            Sign
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right">
                          <TableSortLabel
                            active={signSort.sortConfig.field === 'value'}
                            direction={signSort.sortConfig.field === 'value' ? signSort.sortConfig.direction : 'asc'}
                            onClick={() => signSort.handleSort('value')}
                          >
                            Encounters
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right">Percentage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {signSort.sortedData.map((row) => {
                        const total = signData.reduce((sum, item) => sum + item.value, 0);
                        const percentage = total > 0 ? ((row.value / total) * 100).toFixed(1) : '0';
                        return (
                          <TableRow key={row.name}>
                            <TableCell>{row.name}</TableCell>
                            <TableCell align="right">{row.value}</TableCell>
                            <TableCell align="right">{percentage}%</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </Container>
  );
}
