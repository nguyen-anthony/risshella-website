/**
 * Base villager type with essential fields
 */
export interface VillagerBase {
  villager_id: number;
  name: string;
  image_url: string | null;
}

/**
 * Extended villager type with additional details
 */
export interface VillagerDetailed extends VillagerBase {
  species: string;
  personality: string;
}

/**
 * Default villager type used throughout the application
 */
export type Villager = VillagerBase;
