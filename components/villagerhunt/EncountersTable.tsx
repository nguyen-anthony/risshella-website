"use client";
import * as React from "react";
import { Avatar, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button, TableSortLabel, TablePagination, TextField, InputAdornment, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import UpdateDeleteEncounterModal from "@/components/villagerhunt/UpdateDeleteEncounterModal";
import AddEncounterModal from "@/components/villagerhunt/AddEncounterModal";
import { createClient } from '@/utils/supabase/client';

export type EncounterRow = {
  encounter_id: string;
  island_number: number;
  encountered_at: string; // ISO timestamp
  villager_id: number | null;
};

type Villager = { villager_id: number; name: string; image_url: string | null };
type VillagersIndex = Record<number, { name: string; image_url: string | null }>;

type Props = {
  villagers?: Villager[];
  isOwner: boolean;
  isModerator: boolean;
  huntId: string;
  targetVillagerIds?: number[];
};

const LS_KEY = "villagersIndex.v1";
const TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export default function EncountersTable({ villagers, isOwner, isModerator, huntId, targetVillagerIds }: Props) {
  const [index, setIndex] = React.useState<VillagersIndex | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedEncounter, setSelectedEncounter] = React.useState<EncounterRow | null>(null);
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [encounters, setEncounters] = React.useState<EncounterRow[]>([]);

  // Sorting state
  const [orderBy, setOrderBy] = React.useState<'island_number' | 'encountered_at'>('island_number');
  const [order, setOrder] = React.useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);

  // Search state
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showFilter, setShowFilter] = React.useState(false);


  React.useEffect(() => {
    if (villagers) {
      const mapped: VillagersIndex = {};
      villagers.forEach(v => {
        mapped[v.villager_id] = { name: v.name, image_url: v.image_url ?? null };
      });
      setIndex(mapped);
    } else {
      // Fallback to old behavior if no villagers prop
      let cancelled = false;
      const load = async () => {
        // Try localStorage
        try {
          const raw = localStorage.getItem(LS_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as { ts: number; data: VillagersIndex };
            if (Date.now() - parsed.ts < TTL_MS) {
              if (!cancelled) setIndex(parsed.data);
            }
          }
        } catch {}

        // If no index yet, fetch from API
        if (!index) {
          try {
            const res = await fetch("/api/villagers/index", { cache: "force-cache" });
            if (res.ok) {
              const json: { villagers: Villager[] } = await res.json();
              const mapped: VillagersIndex = {};
              json.villagers.forEach(v => {
                mapped[v.villager_id] = { name: v.name, image_url: v.image_url ?? null };
              });
              if (!cancelled) setIndex(mapped);
              try {
                localStorage.setItem(LS_KEY, JSON.stringify({ ts: Date.now(), data: mapped }));
              } catch {}
            }
          } catch {}
        }
      };
      load();
      return () => { cancelled = true; };
    }
  }, [villagers]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch encounters and set up WebSocket subscription
  React.useEffect(() => {
    const supabase = createClient();

    const fetchEncounters = async () => {
      const { data, error } = await supabase
        .from('encounters')
        .select('encounter_id, island_number, encountered_at, villager_id')
        .eq('hunt_id', huntId)
        .eq('is_deleted', false)
        .order('island_number', { ascending: false });

      if (!error && data) {
        setEncounters(data);
      }
    };

    // Initial fetch
    fetchEncounters();

    // Set up WebSocket connection
    const ws = new WebSocket('wss://villagerhunt-websocket.fly.dev');

    ws.onopen = () => {
      console.log('WebSocket connected');
      // Subscribe to the hunt room
      ws.send(JSON.stringify({ type: 'subscribe', room: huntId }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'update') {
          console.log('WebSocket update:', message);
          // Refetch on any update
          fetchEncounters();
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'unsubscribe', room: huntId }));
        ws.close();
      }
    };
  }, [huntId]);

  const getVillager = (id: number | null) => {
    if (id == null) return { name: "—", image_url: null };
    const v = index?.[id];
    const name = v?.name ?? `#${id}`;
    return { name, image_url: v?.image_url ?? null };
  };

  // Sorting function
  const handleRequestSort = (property: 'island_number' | 'encountered_at') => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Pagination functions
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Sort encounters
  const sortedEncounters = React.useMemo(() => {
    // First filter by search term
    let filtered = [...encounters];
    if (searchTerm.trim() && index) {
      const term = searchTerm.toLowerCase().trim();
      filtered = encounters.filter(encounter => {
        if (encounter.villager_id == null) return false;
        const villager = index[encounter.villager_id];
        const name = villager?.name ?? `#${encounter.villager_id}`;
        return name.toLowerCase().includes(term);
      });
    }

    // Then sort
    return filtered.sort((a, b) => {
      let aValue: number | string = a[orderBy];
      let bValue: number | string = b[orderBy];

      if (orderBy === 'encountered_at') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [encounters, orderBy, order, searchTerm, index]);

  // Paginate encounters
  const paginatedEncounters = React.useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedEncounters.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedEncounters, page, rowsPerPage]);

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'island_number'}
                direction={orderBy === 'island_number' ? order : 'asc'}
                onClick={() => handleRequestSort('island_number')}
              >
                Island
              </TableSortLabel>
            </TableCell>
            <TableCell>Villager
              <IconButton
                size="small"
                onClick={() => setShowFilter(!showFilter)}
                sx={{ ml: 1 }}
              >
                <SearchIcon />
              </IconButton>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'encountered_at'}
                direction={orderBy === 'encountered_at' ? order : 'asc'}
                onClick={() => handleRequestSort('encountered_at')}
              >
                Encountered
              </TableSortLabel>
            </TableCell>
            {(isOwner || isModerator) && <TableCell>Actions</TableCell>}
          </TableRow>
        </TableHead>
        {showFilter && (
          <TableRow>
            <TableCell colSpan={(isOwner || isModerator) ? 4 : 3}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Search villagers..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0); // Reset to first page when searching
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </TableCell>
          </TableRow>
        )}
        <TableBody>
          {(isOwner || isModerator) && (
            <TableRow>
              <TableCell colSpan={(isOwner || isModerator) ? 4 : 3}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setAddModalOpen(true)}
                >
                  Add New Encounter
                </Button>
              </TableCell>
            </TableRow>
          )}
          {paginatedEncounters.map((e) => {
            const { name, image_url } = getVillager(e.villager_id);
            const isDreamie = targetVillagerIds?.includes(e.villager_id || 0) || false;
            return (
              <TableRow key={e.encounter_id} sx={{ bgcolor: isDreamie ? 'success.light' : 'inherit' }}>
                <TableCell>{e.island_number}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar src={image_url ?? undefined} alt={name} sx={{ width: 28, height: 28 }} />
                    <Typography variant="body2">{name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{new Date(e.encountered_at).toLocaleString()}</TableCell>
                {(isOwner || isModerator) && (
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setSelectedEncounter(e);
                        setModalOpen(true);
                      }}
                    >
                      Update/Delete
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={sortedEncounters.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
      <UpdateDeleteEncounterModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        encounter={selectedEncounter}
        villagers={villagers || []}
      />
      <AddEncounterModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        huntId={huntId}
        encounters={encounters}
      />
    </TableContainer>
  );
}
