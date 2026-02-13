import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import BingoCardPageClient from '@/components/villagerhunt/pages/BingoCardPageClient';
import type { Hunt } from '@/types/villagerhunt';

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username}'s Bingo Card - ACNH Villager Hunt`,
  };
}

export default async function BingoCardPage({ params }: Props) {
  const { username } = await params;
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

  // Get active hunt for this creator
  const { data: hunt } = await supabase
    .from('hunts')
    .select('*')
    .eq('twitch_id', creator.twitch_id)
    .in('hunt_status', ['ACTIVE', 'INACTIVE'])
    .order('hunt_id', { ascending: false })
    .maybeSingle();

  return (
    <BingoCardPageClient
      hunt={hunt as Hunt | null}
      username={username}
      displayName={creator.display_name}
    />
  );
}
