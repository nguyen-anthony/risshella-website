"use client";
import * as React from "react";
import { Avatar, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from "@mui/material";

export type EncounterRow = {
  encounter_id: string;
  island_number: number;
  encountered_at: string; // ISO timestamp
  villager_id: number | null;
};

type Villager = { villager_id: number; name: string; image_url: string | null };
type VillagersIndex = Record<number, { name: string; image_url: string | null }>;

type Props = {
  encounters: EncounterRow[];
  villagers?: Villager[];
};

const LS_KEY = "villagersIndex.v1";
const TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export default function EncountersTable({ encounters, villagers }: Props) {
  const [index, setIndex] = React.useState<VillagersIndex | null>(null);

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

  const getVillager = (id: number | null) => {
    if (id == null) return { name: "—", image_url: null };
    const v = index?.[id];
    return { name: v?.name ?? `#${id}`, image_url: v?.image_url ?? null };
  };

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Island</TableCell>
            <TableCell>Villager</TableCell>
            <TableCell>Encountered</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {encounters.map((e) => {
            const { name, image_url } = getVillager(e.villager_id);
            return (
              <TableRow key={e.encounter_id}>
                <TableCell>{e.island_number}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar src={image_url ?? undefined} alt={name} sx={{ width: 28, height: 28 }} />
                    <Typography variant="body2">{name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{new Date(e.encountered_at).toLocaleString()}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
