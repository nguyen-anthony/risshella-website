/**
 * Utility functions for managing bingo card localStorage cleanup
 */

import { createClient } from '@/utils/supabase/client';

/**
 * Remove bingo cards for hunts that are no longer active
 * Should be called periodically (e.g., on app/page load) to clean up old cards
 */
export async function cleanupOldBingoCards(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    // Find all bingo card keys in localStorage
    const bingoCardKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('bingoCard_')) {
        bingoCardKeys.push(key);
      }
    }

    if (bingoCardKeys.length === 0) return;

    // Extract hunt IDs from keys
    const huntIds = bingoCardKeys.map(key => key.replace('bingoCard_', ''));

    // Query hunt statuses from database
    const supabase = createClient();
    const { data: hunts, error } = await supabase
      .from('hunts')
      .select('hunt_id, hunt_status')
      .in('hunt_id', huntIds);

    if (error) {
      console.error('Error fetching hunt statuses for cleanup:', error);
      return;
    }

    // Create a set of active hunt IDs
    const activeHuntIds = new Set(
      hunts
        ?.filter(hunt => hunt.hunt_status === 'ACTIVE')
        .map(hunt => hunt.hunt_id) || []
    );

    const existingHuntIds = new Set(hunts?.map(hunt => hunt.hunt_id) || []);

    // Remove cards for inactive or non-existent hunts
    huntIds.forEach(huntId => {
      if (!existingHuntIds.has(huntId) || !activeHuntIds.has(huntId)) {
        localStorage.removeItem(`bingoCard_${huntId}`);
        console.log(`Cleaned up bingo card for hunt: ${huntId}`);
      }
    });
  } catch (error) {
    console.error('Error during bingo card cleanup:', error);
  }
}

/**
 * Remove bingo card for a specific hunt
 */
export function removeBingoCard(huntId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`bingoCard_${huntId}`);
}
