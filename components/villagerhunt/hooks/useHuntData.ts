"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Hunt } from "@/types/villagerhunt";

export function useHuntData(huntId: string | null) {
  const [hunt, setHunt] = useState<Hunt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHunt = useCallback(async () => {
    if (!huntId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("hunts")
        .select("*")
        .eq("hunt_id", huntId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      setHunt(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch hunt"));
      setHunt(null);
    } finally {
      setLoading(false);
    }
  }, [huntId]);

  useEffect(() => {
    fetchHunt();
  }, [fetchHunt]);

  // Set up real-time subscription
  useEffect(() => {
    if (!huntId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`hunt:${huntId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "hunts",
          filter: `hunt_id=eq.${huntId}`,
        },
        () => {
          fetchHunt();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [huntId, fetchHunt]);

  return { hunt, loading, error, refetch: fetchHunt };
}
