/**
 * Filter villagers by optionally excluding amiibo-only villagers
 */
export function filterExcludedVillagers<T extends { villager_id: number; amiibo_only?: boolean | null }>(
  villagers: T[],
  options: { includeAmiiboOnly?: boolean } = {}
): T[] {
  return villagers.filter(v => {
    // Optionally exclude amiibo-only villagers
    if (!options.includeAmiiboOnly && v.amiibo_only === true) return false;
    
    return true;
  });
}
