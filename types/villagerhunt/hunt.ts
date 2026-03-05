/**
 * Base hunt interface with core fields
 */
export interface HuntBase {
  hunt_id: string;
  hunt_name: string;
  twitch_id: number;
  hunt_status: 'ACTIVE' | 'INACTIVE' | 'PAUSED' | 'COMPLETED' | 'ABANDONED';
}

/**
 * Hunt interface with timestamp fields
 */
export interface HuntWithTimestamps extends HuntBase {
  start_ts: string;
  complete_ts?: string | null;
  pause_ts?: string | null;
  abandon_ts?: string | null;
}

/**
 * Full hunt interface with all fields
 */
export interface HuntFull extends HuntWithTimestamps {
  target_villager_id: number[];
  island_villagers: number[];
  hotel_tourists: number[];
  is_bingo_enabled: boolean;
  bingo_card_size: number;
  bingo_filter_species: string[];
  bingo_filter_personalities: string[];
  is_public: boolean;
}

/**
 * Hunt with active hunt specific fields
 */
export interface ActiveHunt extends HuntFull {
  island_count: number;
}

/**
 * Default hunt type used throughout the application
 */
export type Hunt = HuntFull;
