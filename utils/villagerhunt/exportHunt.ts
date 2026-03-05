/**
 * Utilities for exporting hunt data to CSV format.
 */

export interface HuntExportEncounter {
  island_number: number;
  villager_name: string;
  encountered_at: string;
}

export interface HuntExportData {
  huntName: string;
  dreamies: string[];
  islandVillagers: string[];
  encounters: HuntExportEncounter[];
}

/**
 * Escapes a value for safe inclusion in a CSV cell.
 */
function csvCell(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Builds a formatted CSV string from hunt export data.
 */
export function buildHuntCsv(data: HuntExportData): string {
  const lines: string[] = [];

  // Hunt name header
  lines.push(`Hunt Name,${csvCell(data.huntName)}`);
  lines.push('');

  // Dreamie list section
  lines.push('Dreamie List');
  lines.push('Villager Name');
  if (data.dreamies.length === 0) {
    lines.push('(None)');
  } else {
    for (const name of data.dreamies) {
      lines.push(csvCell(name));
    }
  }
  lines.push('');

  // Island villagers section
  lines.push('Current Island Villagers');
  lines.push('Villager Name');
  if (data.islandVillagers.length === 0) {
    lines.push('(None)');
  } else {
    for (const name of data.islandVillagers) {
      lines.push(csvCell(name));
    }
  }
  lines.push('');

  // Encounters section
  lines.push('Encounters');
  lines.push('Island Number,Villager Name,Encountered At');
  if (data.encounters.length === 0) {
    lines.push('(No encounters recorded)');
  } else {
    for (const e of data.encounters) {
      const timestamp = new Date(e.encountered_at).toLocaleString();
      lines.push(`${csvCell(e.island_number)},${csvCell(e.villager_name)},${csvCell(timestamp)}`);
    }
  }

  return lines.join('\n');
}

/**
 * Triggers a browser download of the given CSV content.
 */
export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates a safe filename from a hunt name.
 */
export function huntExportFilename(huntName: string): string {
  const safe = huntName.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  return `${safe || 'hunt'}_export.csv`;
}
