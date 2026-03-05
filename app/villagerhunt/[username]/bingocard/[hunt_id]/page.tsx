import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import BingoCardPageClient from '@/components/villagerhunt/pages/BingoCardPageClient';
import type { Hunt } from '@/types/villagerhunt';

type Props = {
  params: Promise<{ username: string; hunt_id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username}'s Bingo Card - ACNH Villager Hunt`,
  };
}

export default async function HistoryBingoCardPage({ params }: Props) {
  const { username, hunt_id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get creator by username
  const { data: creator, error: creatorError } = await supabase
    .from('creators')
    .select('twitch_id, twitch_username, display_name')
    .eq('twitch_username', username)
    .single();

  if (creatorError || !creator) {
    notFound();
  }

  // Get hunt by hunt_id, ensuring it belongs to this creator — any status allowed
  const { data: hunt, error: huntError } = await supabase
    .from('hunts')
    .select('*')
    .eq('hunt_id', hunt_id)
    .eq('twitch_id', creator.twitch_id)
    .maybeSingle();

  if (huntError || !hunt) {
    notFound();
  }

  const backUrl = `/villagerhunt/${encodeURIComponent(username)}/history/${hunt_id}`;

  return (
    <BingoCardPageClient
      hunt={hunt as Hunt}
      username={username}
      displayName={creator.display_name}
      backUrl={backUrl}
    />
  );
}
