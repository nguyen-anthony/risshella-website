export async function generateBingoCard({
  huntId,
  huntName,
  creatorName,
  targetVillagers,
  islandVillagers,
  hotelTourists,
  villagers,
  bingoCardSize = 5,
}: {
  huntId: string;
  huntName: string;
  creatorName: string;
  targetVillagers: { villager_id: number; name: string; image_url: string | null }[];
  islandVillagers: number[];
  hotelTourists: number[];
  villagers: { villager_id: number; name: string; image_url: string | null }[];
  bingoCardSize?: number;
}): Promise<string> {
  // Get available villagers (exclude target, island, and hotel tourists)
  const excludedIds = new Set([
    ...targetVillagers.map(v => v.villager_id),
    ...islandVillagers,
    ...hotelTourists,
  ]);

  const availableVillagers = villagers.filter(v => !excludedIds.has(v.villager_id));

  // Calculate required villagers based on size and free spaces
  const totalSquares = bingoCardSize * bingoCardSize;
  const freeSpaces = bingoCardSize === 3 || bingoCardSize === 5 ? 1 : 0; // 3x3 and 5x5 have 1 free space, 4x4 has none
  const requiredVillagers = totalSquares - freeSpaces;

  if (availableVillagers.length < requiredVillagers) {
    alert(`Not enough villagers available for ${bingoCardSize}x${bingoCardSize} bingo card generation. Need ${requiredVillagers}, have ${availableVillagers.length}.`);
    throw new Error('Not enough villagers');
  }

  // Shuffle and select required villagers
  const shuffled = [...availableVillagers].sort(() => Math.random() - 0.5);
  const bingoVillagers = shuffled.slice(0, requiredVillagers);

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
      hotelTourists,
      bingoVillagers,
      bingoCardSize,
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