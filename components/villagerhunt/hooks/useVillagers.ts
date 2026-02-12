"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Villager } from "@/types/villagerhunt";
import { filterExcludedVillagers } from "@/utils/villagerhunt";
import { getLocalStorage, setLocalStorage } from "@/utils/villagerhunt";

const LS_KEY_BASE = "villagersIndex.v2";
const TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export function useVillagers(options: { includeAmiiboOnly?: boolean } = {}) {
  const [villagers, setVillagers] = useState<Villager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadVillagers = async () => {
      try {
        // Create cache key based on options
        const LS_KEY = options.includeAmiiboOnly ? `${LS_KEY_BASE}.amiibo` : LS_KEY_BASE;
        
        // Try localStorage first
        const cached = getLocalStorage<Villager[]>(LS_KEY, TTL_MS);
        if (cached && !cancelled) {
          setVillagers(cached);
          setLoading(false);
          return;
        }

        // Fetch from database
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from("villagers")
          .select("villager_id, name, image_url, amiibo_only")
          .order("name");

        if (fetchError) throw fetchError;

        const filtered = filterExcludedVillagers(data || [], options);
        
        if (!cancelled) {
          setVillagers(filtered);
          setLocalStorage(LS_KEY, filtered);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to load villagers"));
          setLoading(false);
        }
      }
    };

    loadVillagers();

    return () => {
      cancelled = true;
    };
  }, []);

  return { villagers, loading, error };
}
