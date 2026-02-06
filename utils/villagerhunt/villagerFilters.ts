/**
 * Excluded villager IDs that require additional purchases (not part of base game)
 */
export const EXCLUDED_VILLAGER_IDS = [627, 573, 571, 731, 811, 876];

/**
 * Filter villagers by excluding specific IDs
 */
export function filterExcludedVillagers<T extends { villager_id: number }>(
  villagers: T[]
): T[] {
  return villagers.filter(v => !EXCLUDED_VILLAGER_IDS.includes(v.villager_id));
}

/**
 * Check if a villager ID is excluded
 */
export function isVillagerExcluded(villagerId: number): boolean {
  return EXCLUDED_VILLAGER_IDS.includes(villagerId);
}
