export interface BingoFilters {
  species: string[];
  personalities: string[];
}

/**
 * Select random villagers for a bingo card (without generating an image)
 * Returns an array of villager IDs to be used in the interactive card
 */
export function selectBingoVillagers({
  targetVillagers,
  islandVillagers,
  hotelTourists,
  villagers,
  bingoCardSize = 5,
  filters,
  removeFreeSpace,
}: {
  targetVillagers: { villager_id: number }[];
  islandVillagers: number[];
  hotelTourists: number[];
  villagers: { villager_id: number; species?: string; personality?: string }[];
  bingoCardSize?: number;
  filters?: BingoFilters;
  removeFreeSpace?: boolean;
}): number[] {
  // Get available villagers (exclude target, island, and hotel tourists)
  const excludedIds = new Set([
    ...targetVillagers.map(v => v.villager_id),
    ...islandVillagers,
    ...hotelTourists,
  ]);

  let availableVillagers = villagers.filter(v => !excludedIds.has(v.villager_id));

  // Apply species and personality filters if provided
  if (filters) {
    if (filters.species.length > 0) {
      availableVillagers = availableVillagers.filter(v => 
        v.species && filters.species.includes(v.species)
      );
    }
    if (filters.personalities.length > 0) {
      availableVillagers = availableVillagers.filter(v =>
        v.personality && filters.personalities.includes(v.personality)
      );
    }
  }

  // Calculate required villagers based on size and free spaces
  const totalSquares = bingoCardSize * bingoCardSize;
  const freeSpaces = removeFreeSpace ? 0 : (bingoCardSize === 3 || bingoCardSize === 5 ? 1 : 0);
  const requiredVillagers = totalSquares - freeSpaces;

  if (availableVillagers.length < requiredVillagers) {
    throw new Error(
      `Not enough villagers available for ${bingoCardSize}x${bingoCardSize} bingo card. Need ${requiredVillagers}, have ${availableVillagers.length}.`
    );
  }

  // Shuffle and select required villagers
  const shuffled = [...availableVillagers].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, requiredVillagers);
  
  return selected.map(v => v.villager_id);
}

/**
 * Count how many villagers match the given filters
 * Useful for validation before generating a card
 */
export function countMatchingVillagers({
  targetVillagers,
  islandVillagers,
  hotelTourists,
  villagers,
  filters,
}: {
  targetVillagers: { villager_id: number }[];
  islandVillagers: number[];
  hotelTourists: number[];
  villagers: { villager_id: number; species?: string; personality?: string }[];
  filters?: BingoFilters;
}): number {
  // Get available villagers (exclude target, island, and hotel tourists)
  const excludedIds = new Set([
    ...targetVillagers.map(v => v.villager_id),
    ...islandVillagers,
    ...hotelTourists,
  ]);

  let availableVillagers = villagers.filter(v => !excludedIds.has(v.villager_id));

  // Apply species and personality filters if provided
  if (filters) {
    if (filters.species.length > 0) {
      availableVillagers = availableVillagers.filter(v =>
        v.species && filters.species.includes(v.species)
      );
    }
    if (filters.personalities.length > 0) {
      availableVillagers = availableVillagers.filter(v =>
        v.personality && filters.personalities.includes(v.personality)
      );
    }
  }

  return availableVillagers.length;
}