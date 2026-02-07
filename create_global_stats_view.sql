-- Drop existing view if it exists
DROP MATERIALIZED VIEW IF EXISTS global_hunt_stats CASCADE;

-- Create materialized view for global statistics
CREATE MATERIALIZED VIEW global_hunt_stats AS
WITH public_hunts AS (
    SELECT 
        h.hunt_id,
        h.twitch_id,
        h.hunt_status,
        h.target_villager_id,
        c.twitch_username
    FROM hunts h
    INNER JOIN creators c ON h.twitch_id = c.twitch_id
    WHERE c.is_public = true
    AND h.hunt_status IN ('ACTIVE', 'COMPLETED')
),
encounter_counts AS (
    SELECT 
        e.hunt_id,
        e.villager_id,
        COUNT(*) as encounter_count
    FROM encounters e
    WHERE e.is_deleted = false
    GROUP BY e.hunt_id, e.villager_id
),
hunt_totals AS (
    SELECT 
        ph.hunt_id,
        ph.twitch_id,
        ph.twitch_username,
        ph.hunt_status,
        COALESCE(SUM(ec.encounter_count), 0) as total_encounters
    FROM public_hunts ph
    LEFT JOIN encounter_counts ec ON ph.hunt_id = ec.hunt_id
    GROUP BY ph.hunt_id, ph.twitch_id, ph.twitch_username, ph.hunt_status
),
villager_totals AS (
    SELECT 
        ec.villager_id,
        SUM(ec.encounter_count) as total_count
    FROM encounter_counts ec
    INNER JOIN public_hunts ph ON ec.hunt_id = ph.hunt_id
    GROUP BY ec.villager_id
),
dreamie_totals AS (
    SELECT 
        villager_id,
        COUNT(*) as dreamie_count
    FROM public_hunts
    CROSS JOIN LATERAL unnest(target_villager_id) as villager_id
    GROUP BY villager_id
)
SELECT 
    -- Summary statistics
    (SELECT COUNT(DISTINCT twitch_id) FROM public_hunts) as total_public_creators,
    (SELECT COUNT(*) FROM public_hunts) as total_hunts,
    (SELECT SUM(total_encounters) FROM hunt_totals) as total_encounters,
    
    -- Longest active hunt (most encounters)
    (
        SELECT jsonb_build_object(
            'hunt_id', hunt_id,
            'twitch_id', twitch_id,
            'username', twitch_username,
            'encounter_count', total_encounters,
            'status', hunt_status
        )
        FROM hunt_totals
        WHERE hunt_status = 'ACTIVE'
        ORDER BY total_encounters DESC
        LIMIT 1
    ) as longest_active_hunt,
    
    -- Longest completed hunt (most encounters)
    (
        SELECT jsonb_build_object(
            'hunt_id', hunt_id,
            'twitch_id', twitch_id,
            'username', twitch_username,
            'encounter_count', total_encounters,
            'status', hunt_status
        )
        FROM hunt_totals
        WHERE hunt_status = 'COMPLETED'
        ORDER BY total_encounters DESC
        LIMIT 1
    ) as longest_completed_hunt,
    
    -- Most encountered villager
    (
        SELECT jsonb_build_object(
            'villager_id', villager_id,
            'count', total_count
        )
        FROM villager_totals
        ORDER BY total_count DESC
        LIMIT 1
    ) as most_encountered_villager,
    
    -- Least encountered villager
    (
        SELECT jsonb_build_object(
            'villager_id', villager_id,
            'count', total_count
        )
        FROM villager_totals
        ORDER BY total_count ASC
        LIMIT 1
    ) as least_encountered_villager,
    
    -- Top 5 dreamies
    (
        SELECT jsonb_agg(
            jsonb_build_object(
                'villager_id', villager_id,
                'count', dreamie_count
            )
            ORDER BY dreamie_count DESC
        )
        FROM (
            SELECT villager_id, dreamie_count
            FROM dreamie_totals
            ORDER BY dreamie_count DESC
            LIMIT 5
        ) top_dreamies
    ) as top_dreamies,
    
    -- All villager encounter counts (for distributions)
    (
        SELECT jsonb_object_agg(villager_id::text, total_count)
        FROM villager_totals
    ) as villager_encounter_counts,
    
    -- Timestamp for cache invalidation
    now() as last_updated;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX idx_global_hunt_stats ON global_hunt_stats ((1));

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_global_hunt_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY global_hunt_stats;
END;
$$ LANGUAGE plpgsql;

-- Initial refresh
REFRESH MATERIALIZED VIEW global_hunt_stats;
