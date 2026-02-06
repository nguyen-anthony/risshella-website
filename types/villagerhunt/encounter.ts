/**
 * Encounter record from the database
 */
export interface Encounter {
  encounter_id: string;
  hunt_id: string;
  island_number: number;
  encountered_at: string;
  villager_id: number | null;
  is_deleted: boolean;
}

/**
 * Encounter with additional villager information
 */
export interface EncounterWithVillager extends Encounter {
  villager_name?: string;
  villager_image_url?: string | null;
}

/**
 * Type alias for encounter table rows
 */
export type EncounterRow = Encounter;
