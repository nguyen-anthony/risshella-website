'use client';

import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { createClient } from '@/utils/supabase/client';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

type Villager = {
  villager_id: number;
  name: string;
  species: string;
  personality: string;
  image_url: string | null;
};

type Encounter = {
  villager_id: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  huntId: string;
};

type ChartData = {
  name: string;
  value: number;
};

type VillagerStat = {
  villager: Villager;
  count: number;
};

export default function HuntStatisticsModal({ open, onClose, huntId }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [speciesData, setSpeciesData] = React.useState<ChartData[]>([]);
  const [personalityData, setPersonalityData] = React.useState<ChartData[]>([]);
  const [topVillagers, setTopVillagers] = React.useState<VillagerStat[]>([]);
  const [hoveredSpecies, setHoveredSpecies] = React.useState<string | null>(null);
  const [hoveredPersonality, setHoveredPersonality] = React.useState<string | null>(null);
  const [uniqueVillagersCount, setUniqueVillagersCount] = React.useState(0);
  const [repeatVillagersCount, setRepeatVillagersCount] = React.useState(0);
  const [totalUniqueSeen, setTotalUniqueSeen] = React.useState(0);
  const [totalVillagersInGame, setTotalVillagersInGame] = React.useState(0);

  const fetchStatistics = React.useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Fetch encounters for this hunt
      const { data: encounters, error: encountersError } = await supabase
        .from('encounters')
        .select('villager_id')
        .eq('hunt_id', huntId)
        .eq('is_deleted', false);

      if (encountersError) {
        console.error('Error fetching encounters:', encountersError);
        return;
      }

      if (!encounters || encounters.length === 0) {
        setSpeciesData([]);
        setPersonalityData([]);
        setTopVillagers([]);
        setUniqueVillagersCount(0);
        setRepeatVillagersCount(0);
        setTotalUniqueSeen(0);
        setTotalVillagersInGame(0);
        return;
      }

      // Get unique villager IDs and their counts
      const villagerCounts: Record<number, number> = {};
      encounters.forEach((encounter: Encounter) => {
        villagerCounts[encounter.villager_id] = (villagerCounts[encounter.villager_id] || 0) + 1;
      });

      // Calculate villager statistics
      const uniqueVillagers = Object.values(villagerCounts).filter(count => count === 1).length;
      const repeatVillagers = Object.values(villagerCounts).filter(count => count > 1).length;
      const totalUnique = Object.keys(villagerCounts).length;

      // Fetch total villagers in game
      const { count: totalVillagers, error: totalError } = await supabase
        .from('villagers')
        .select('*', { count: 'exact', head: true });

      if (totalError) {
        console.error('Error fetching total villagers:', totalError);
      }

      // Fetch villager data for all encountered villagers
      const villagerIds = Object.keys(villagerCounts).map(id => parseInt(id));
      const { data: villagers, error: villagersError } = await supabase
        .from('villagers')
        .select('villager_id, name, species, personality, image_url')
        .in('villager_id', villagerIds);

      if (villagersError) {
        console.error('Error fetching villagers:', villagersError);
        return;
      }

      // Build statistics
      const speciesCount: Record<string, number> = {};
      const personalityCount: Record<string, number> = {};
      const villagerStats: VillagerStat[] = [];

      villagers?.forEach((villager: Villager) => {
        const count = villagerCounts[villager.villager_id] || 0;

        // Species stats
        speciesCount[villager.species] = (speciesCount[villager.species] || 0) + count;

        // Personality stats
        personalityCount[villager.personality] = (personalityCount[villager.personality] || 0) + count;

        // Individual villager stats
        villagerStats.push({ villager, count });
      });

      // Convert to chart data format
      const speciesChartData: ChartData[] = Object.entries(speciesCount).map(([name, value]) => ({
        name,
        value,
      }));

      const personalityChartData: ChartData[] = Object.entries(personalityCount).map(([name, value]) => ({
        name,
        value,
      }));

      // Sort villagers by encounter count and take top 5
      const top5Villagers = villagerStats
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setSpeciesData(speciesChartData);
      setPersonalityData(personalityChartData);
      setTopVillagers(top5Villagers);
      setUniqueVillagersCount(uniqueVillagers);
      setRepeatVillagersCount(repeatVillagers);
      setTotalUniqueSeen(totalUnique);
      setTotalVillagersInGame(totalVillagers || 0);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  }, [huntId]);

  React.useEffect(() => {
    if (open && huntId) {
      fetchStatistics();
    }
  }, [open, huntId, fetchStatistics]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Hunt Statistics</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            {/* Summary Statistics */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Hunt Summary</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">{uniqueVillagersCount}</Typography>
                  <Typography variant="body2" color="text.secondary">Unique Villagers Seen</Typography>
                  <Typography variant="caption">(Encountered exactly once)</Typography>
                </Paper>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="secondary">{repeatVillagersCount}</Typography>
                  <Typography variant="body2" color="text.secondary">Repeat Villagers Seen</Typography>
                  <Typography variant="caption">(Encountered more than once)</Typography>
                </Paper>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">{totalUniqueSeen}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Unique Villagers Seen</Typography>
                  <Typography variant="caption">Out of {totalVillagersInGame} total villagers</Typography>
                </Paper>
              </Box>
            </Box>

            {/* Species Distribution */}
            <Typography variant="h6" sx={{ mb: 2 }}>Species Distribution</Typography>
            {speciesData.length > 0 ? (
              <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
                <Box sx={{ height: 300, flex: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={speciesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        onMouseEnter={(_, index) => setHoveredSpecies(speciesData[index]?.name || null)}
                        onMouseLeave={() => setHoveredSpecies(null)}
                      >
                        {speciesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ flex: 1, maxHeight: 300, overflow: 'auto' }}>
                  <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Species</TableCell>
                          <TableCell align="right">Count</TableCell>
                          <TableCell align="right">Percentage</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[...speciesData]
                          .sort((a, b) => b.value - a.value)
                          .map((row) => {
                            const total = speciesData.reduce((sum, item) => sum + item.value, 0);
                            const percentage = total > 0 ? ((row.value / total) * 100).toFixed(1) : '0';
                            return (
                              <TableRow 
                                key={row.name}
                                sx={{
                                  backgroundColor: hoveredSpecies === row.name ? 'rgba(0, 136, 254, 0.1)' : 'inherit',
                                  '&:hover': {
                                    backgroundColor: hoveredSpecies === row.name ? 'rgba(0, 136, 254, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                                  },
                                }}
                              >
                                <TableCell>{row.name}</TableCell>
                                <TableCell align="right">{row.value}</TableCell>
                                <TableCell align="right">{percentage}%</TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                No encounter data available for species distribution.
              </Typography>
            )}

            {/* Personality Distribution */}
            <Typography variant="h6" sx={{ mb: 2 }}>Personality Distribution</Typography>
            {personalityData.length > 0 ? (
              <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
                <Box sx={{ height: 300, flex: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={personalityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        onMouseEnter={(_, index) => setHoveredPersonality(personalityData[index]?.name || null)}
                        onMouseLeave={() => setHoveredPersonality(null)}
                      >
                        {personalityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ flex: 1, maxHeight: 300, overflow: 'auto' }}>
                  <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Personality</TableCell>
                          <TableCell align="right">Count</TableCell>
                          <TableCell align="right">Percentage</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[...personalityData]
                          .sort((a, b) => b.value - a.value)
                          .map((row) => {
                            const total = personalityData.reduce((sum, item) => sum + item.value, 0);
                            const percentage = total > 0 ? ((row.value / total) * 100).toFixed(1) : '0';
                            return (
                              <TableRow 
                                key={row.name}
                                sx={{
                                  backgroundColor: hoveredPersonality === row.name ? 'rgba(0, 136, 254, 0.1)' : 'inherit',
                                  '&:hover': {
                                    backgroundColor: hoveredPersonality === row.name ? 'rgba(0, 136, 254, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                                  },
                                }}
                              >
                                <TableCell>{row.name}</TableCell>
                                <TableCell align="right">{row.value}</TableCell>
                                <TableCell align="right">{percentage}%</TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                No encounter data available for personality distribution.
              </Typography>
            )}

            {/* Top 5 Villagers */}
            <Typography variant="h6" sx={{ mb: 2 }}>Top 5 Most Encountered Villagers</Typography>
            {topVillagers.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Villager</TableCell>
                      <TableCell align="right">Encounters</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topVillagers.map((stat) => (
                      <TableRow key={stat.villager.villager_id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              component="img"
                              src={stat.villager.image_url || undefined}
                              alt={stat.villager.name}
                              sx={{ width: 40, height: 40, borderRadius: 1 }}
                            />
                            <Typography>{stat.villager.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">{stat.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No encounter data available.
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}