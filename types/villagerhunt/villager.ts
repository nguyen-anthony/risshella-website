/**
 * Base villager type with essential fields
 */
export interface VillagerBase {
  villager_id: number;
  name: string;
  image_url: string | null;
  amiibo_only?: boolean | null;
}

/**
 * Extended villager type with additional details
 */
export interface VillagerDetailed extends VillagerBase {
  species: string;
  personality: string;
  sign: string;
}

/**
 * Default villager type used throughout the application
 */
export type Villager = VillagerDetailed;
