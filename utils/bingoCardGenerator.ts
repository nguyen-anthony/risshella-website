export async function generateBingoCard({
  huntId,
  huntName,
  creatorName,
  targetVillagers,
  islandVillagers,
  villagers,
}: {
  huntId: string;
  huntName: string;
  creatorName: string;
  targetVillagers: { villager_id: number; name: string; image_url: string | null }[];
  islandVillagers: number[];
  villagers: { villager_id: number; name: string; image_url: string | null }[];
}): Promise<string> {
  // Get available villagers (exclude target and island villagers)
  const excludedIds = new Set([
    ...targetVillagers.map(v => v.villager_id),
    ...islandVillagers,
  ]);

  const availableVillagers = villagers.filter(v => !excludedIds.has(v.villager_id));

  if (availableVillagers.length < 24) {
    alert('Not enough villagers available for bingo card generation.');
    throw new Error('Not enough villagers');
  }

  // Shuffle and select 24 villagers
  const shuffled = [...availableVillagers].sort(() => Math.random() - 0.5);
  const bingoVillagers = shuffled.slice(0, 24);

  // Call server-side API to generate the image
  const response = await fetch('/api/bingo/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      huntId,
      huntName,
      creatorName,
      targetVillagers,
      islandVillagers,
      bingoVillagers,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate bingo card');
  }

  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}