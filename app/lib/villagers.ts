import { SupabaseClient } from '@supabase/supabase-js';

type NookipediaVillager = {
  name: string;
  image_url?: string | null;
  species?: string | null;
  personality?: string | null;
  gender?: string | null;
  sign?: string | null;
  url?: string | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export async function refreshVillagersIfStale(supabase: SupabaseClient): Promise<{ refreshed: boolean; reason?: string }>{
  try {
    // 1) Check staleness
    const { data: latest } = await supabase
      .from('villagers')
      .select('last_refreshed')
      .order('last_refreshed', { ascending: false })
      .limit(1)
      .maybeSingle();

    const now = Date.now();
    const last = latest?.last_refreshed ? new Date(latest.last_refreshed).getTime() : 0;
    const isStale = !latest || !latest.last_refreshed || now - last > DAY_MS;
    if (!isStale) return { refreshed: false, reason: 'fresh' };

    // 2) Fetch all villagers from Nookipedia
    const API_KEY = process.env.NOOKIPEDIA_API_KEY;
    const USER_AGENT = process.env.NOOKIPEDIA_USER_AGENT || '';
    if (!API_KEY) return { refreshed: false, reason: 'missing_api_key' };

    const res = await fetch('https://api.nookipedia.com/villagers', {
      headers: {
        'X-API-KEY': API_KEY,
        'Accept': 'application/json',
        'User-Agent': USER_AGENT,
      },
      // Cache disabled; we explicitly want fresh data when we decide to refresh
      cache: 'no-store',
    });
    if (!res.ok) return { refreshed: false, reason: `fetch_failed_${res.status}` };
    const json = (await res.json()) as NookipediaVillager[];

    // 3) Build maps for update vs insert based on villager name
    const nowIso = new Date().toISOString();
    const normalized = (s: string) => s.trim();

    // Get existing villagers keyed by name
    const { data: existing } = await supabase
      .from('villagers')
      .select('villager_id, name');

    type ExistingVillager = { villager_id: number; name: string };
    const idByName = new Map<string, number>();
    (existing as ExistingVillager[] | null)?.forEach((v) => idByName.set(normalized(v.name), v.villager_id));

    type UpsertVillager = {
      villager_id?: number;
      name: string;
      image_url: string | null;
      species: string | null;
      personality: string | null;
      gender: string | null;
      sign: string | null;
      url: string | null;
      last_refreshed: string;
    };

    const updateRows: UpsertVillager[] = [];
    const insertRows: UpsertVillager[] = [];

    for (const v of json) {
      const name = normalized(v.name);
      if (!name) continue;

      const row = {
        name,
        image_url: v.image_url ?? null,
        species: v.species ?? null,
        personality: v.personality ?? null,
        gender: v.gender ?? null,
        sign: v.sign ?? null,
        url: v.url ?? null,
        last_refreshed: nowIso,
      };

      const existingId = idByName.get(name);
      if (existingId) {
        updateRows.push({ villager_id: existingId, ...row });
      } else {
        insertRows.push(row);
      }
    }

    // 4) Write in chunks to avoid payload limits
    const chunk = async <T,>(arr: T[], size: number, op: (items: T[]) => Promise<unknown>) => {
      for (let i = 0; i < arr.length; i += size) {
        const part = arr.slice(i, i + size);
        if (part.length) await op(part);
      }
    };

    // Upsert updates by primary key
    await chunk(updateRows, 200, async (items) => {
      await supabase.from('villagers').upsert(items);
    });
    // Insert new ones
    await chunk(insertRows, 200, async (items) => {
      await supabase.from('villagers').insert(items);
    });

    return { refreshed: true };
  } catch {
    // Swallow errors to avoid breaking the page; report as not refreshed
    return { refreshed: false, reason: 'exception' };
  }
}
