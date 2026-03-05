'use client';

import * as React from 'react';
import { Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { createClient } from '@/utils/supabase/client';
import { buildHuntCsv, downloadCsv, huntExportFilename } from '@/utils/villagerhunt/exportHunt';
import type { Villager } from '@/types/villagerhunt';

type Props = {
  huntId: string;
  huntName: string;
  targetVillagerIds: number[];
  islandVillagerIds: number[];
  villagers: Villager[];
};

export default function ExportHuntButton({
  huntId,
  huntName,
  targetVillagerIds,
  islandVillagerIds,
  villagers,
}: Props) {
  const [loading, setLoading] = React.useState(false);

  // Build an id-to-name lookup from the villagers array
  const villagersMap = React.useMemo(() => {
    const map: Record<number, string> = {};
    villagers.forEach((v) => {
      map[v.villager_id] = v.name;
    });
    return map;
  }, [villagers]);

  const handleExport = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Fetch all encounters for this hunt in batches
      type EncounterRow = { island_number: number; villager_id: number | null; encountered_at: string };
      let allEncounters: EncounterRow[] = [];
      let from = 0;
      const batchSize = 1000;

      while (true) {
        const { data, error } = await supabase
          .from('encounters')
          .select('island_number, villager_id, encountered_at')
          .eq('hunt_id', huntId)
          .eq('is_deleted', false)
          .order('island_number', { ascending: true })
          .order('encountered_at', { ascending: true })
          .range(from, from + batchSize - 1);

        if (error || !data || data.length === 0) break;
        allEncounters = allEncounters.concat(data as EncounterRow[]);
        if (data.length < batchSize) break;
        from += batchSize;
      }

      const dreamies = targetVillagerIds.map((id) => villagersMap[id] ?? `#${id}`);
      const islandVillagers = islandVillagerIds.map((id) => villagersMap[id] ?? `#${id}`);
      const encounters = allEncounters.map((e) => ({
        island_number: e.island_number,
        villager_name:
          e.villager_id != null ? (villagersMap[e.villager_id] ?? `#${e.villager_id}`) : '—',
        encountered_at: e.encountered_at,
      }));

      const csv = buildHuntCsv({ huntName, dreamies, islandVillagers, encounters });
      downloadCsv(csv, huntExportFilename(huntName));
    } catch (err) {
      console.error('Failed to export hunt data:', err);
      alert('Failed to export hunt data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outlined"
      startIcon={<DownloadIcon />}
      onClick={handleExport}
      disabled={loading}
    >
      {loading ? 'Exporting...' : 'Export CSV'}
    </Button>
  );
}
