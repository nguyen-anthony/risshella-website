import html2canvas from 'html2canvas';

type Villager = {
  villager_id: number;
  name: string;
  image_url: string | null;
};

async function preloadImages(urls: string[]): Promise<Record<string, string>> {
  // Use a CORS proxy to load images
  const CORS_PROXY = 'https://api.codetabs.com/v1/proxy?quest=';

  const urlMap: Record<string, string> = {};
  urls.forEach(url => {
    urlMap[url] = CORS_PROXY + encodeURIComponent(url);
  });

  return urlMap;
}

async function waitForImagesToLoad(container: HTMLElement): Promise<void> {
  const images = container.querySelectorAll('img');
  const promises = Array.from(images).map(img => {
    return new Promise<void>((resolve) => {
      if (img.complete && img.naturalHeight > 0) {
        // Image already loaded
        resolve();
      } else {
        // Wait for image to load
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Continue even if image fails
        // If image is already loading, the onload will still fire
      }
    });
  });
  await Promise.all(promises);
}

function createBingoCardHTML({
  huntName,
  creatorName,
  targetVillager,
  bingoVillagers,
  imageUrlMap,
}: {
  huntName: string;
  creatorName: string;
  targetVillager: { name: string; image_url: string | null } | null;
  bingoVillagers: Villager[];
  imageUrlMap: Record<string, string>;
}) {
  const container = document.createElement('div');
  container.style.width = '800px';
  container.style.padding = '20px';
  container.style.backgroundColor = '#ffffff';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.alignItems = 'center';

  // Header
  const header = document.createElement('div');
  header.style.textAlign = 'center';
  header.style.marginBottom = '20px';

  const title = document.createElement('h1');
  title.textContent = 'Animal Crossing Villager Hunt';
  title.style.margin = '0 0 10px 0';
  title.style.color = '#2e7d32';
  title.style.fontSize = '32px';

  const huntInfo = document.createElement('div');
  huntInfo.style.fontSize = '18px';
  huntInfo.style.marginBottom = '10px';
  huntInfo.innerHTML = `
    <strong>Hunt:</strong> ${huntName}<br>
    <strong>Creator:</strong> ${creatorName}
  `;

  if (targetVillager) {
    const targetInfo = document.createElement('div');
    targetInfo.style.display = 'flex';
    targetInfo.style.alignItems = 'center';
    targetInfo.style.gap = '10px';
    targetInfo.style.fontSize = '16px';

    const targetLabel = document.createElement('strong');
    targetLabel.textContent = 'Target:';

    const targetImg = document.createElement('img');
    targetImg.src = imageUrlMap[targetVillager.image_url || ''] || targetVillager.image_url || '';
    targetImg.alt = targetVillager.name;
    targetImg.style.width = '32px';
    targetImg.style.height = '32px';
    targetImg.style.borderRadius = '4px';

    const targetName = document.createElement('span');
    targetName.textContent = targetVillager.name;

    targetInfo.appendChild(targetLabel);
    targetInfo.appendChild(targetImg);
    targetInfo.appendChild(targetName);
    huntInfo.appendChild(targetInfo);
  }

  header.appendChild(title);
  header.appendChild(huntInfo);

  // Bingo grid
  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(5, 1fr)';
  grid.style.gap = '2px';
  grid.style.border = '3px solid #2e7d32';
  grid.style.backgroundColor = '#2e7d32';

  // B-I-N-G-O letters
  const letters = ['B', 'I', 'N', 'G', 'O'];
  letters.forEach(letter => {
    const cell = document.createElement('div');
    cell.style.backgroundColor = '#2e7d32';
    cell.style.color = 'white';
    cell.style.display = 'flex';
    cell.style.alignItems = 'center';
    cell.style.justifyContent = 'center';
    cell.style.height = '40px';
    cell.style.fontWeight = 'bold';
    cell.style.fontSize = '20px';
    cell.textContent = letter;
    grid.appendChild(cell);
  });

  // Bingo squares
  for (let i = 0; i < 25; i++) {
    const cell = document.createElement('div');
    cell.style.backgroundColor = 'white';
    cell.style.border = '1px solid #2e7d32';
    cell.style.display = 'flex';
    cell.style.flexDirection = 'column';
    cell.style.alignItems = 'center';
    cell.style.justifyContent = 'center';
    cell.style.padding = '8px';
    cell.style.minHeight = '120px';
    cell.style.textAlign = 'center';

    if (i === 12) { // Center square (free)
      cell.style.backgroundColor = '#e8f5e8';
      cell.style.fontWeight = 'bold';
      cell.style.fontSize = '16px';
      cell.textContent = 'FREE';
      const subText = document.createElement('div');
      subText.textContent = 'Villager Hunt';
      subText.style.fontSize = '12px';
      subText.style.marginTop = '4px';
      cell.appendChild(subText);
    } else {
      const villagerIndex = i < 12 ? i : i - 1; // Skip center
      const villager = bingoVillagers[villagerIndex];

      if (villager?.image_url) {
        const img = document.createElement('img');
        img.src = imageUrlMap[villager.image_url] || villager.image_url;
        img.alt = villager.name;
        img.style.width = '48px';
        img.style.height = '48px';
        img.style.borderRadius = '4px';
        img.style.marginBottom = '4px';
        cell.appendChild(img);
      }

      const name = document.createElement('div');
      name.textContent = villager?.name || 'Unknown';
      name.style.fontSize = '12px';
      name.style.fontWeight = 'bold';
      cell.appendChild(name);
    }

    grid.appendChild(cell);
  }

  container.appendChild(header);
  container.appendChild(grid);

  return container;
}

export async function generateBingoCard({
  huntId,
  huntName,
  creatorName,
  targetVillager,
  islandVillagers,
  villagers,
}: {
  huntId: string;
  huntName: string;
  creatorName: string;
  targetVillager: { villager_id: number; name: string; image_url: string | null } | null;
  islandVillagers: number[];
  villagers: Villager[];
}): Promise<string> {
  // Get available villagers (exclude target and island villagers)
  const excludedIds = new Set([
    targetVillager?.villager_id,
    ...islandVillagers,
  ].filter(Boolean));

  const availableVillagers = villagers.filter(v => !excludedIds.has(v.villager_id));

  if (availableVillagers.length < 24) {
    alert('Not enough villagers available for bingo card generation.');
    throw new Error('Not enough villagers');
  }

  // Shuffle and select 24 villagers
  const shuffled = [...availableVillagers].sort(() => Math.random() - 0.5);
  const bingoVillagers = shuffled.slice(0, 24);

  // Preload all villager images and convert to data URLs or proxy URLs
  const imageUrls = [
    targetVillager?.image_url,
    ...bingoVillagers.map(v => v.image_url).filter(Boolean),
  ].filter(Boolean) as string[];

  const imageUrlMap = await preloadImages(imageUrls);

  // Create bingo card HTML with proxied image URLs
  const bingoCard = createBingoCardHTML({
    huntName,
    creatorName,
    targetVillager,
    bingoVillagers,
    imageUrlMap,
  });

  // Temporarily add to DOM
  document.body.appendChild(bingoCard);

  try {
    // Wait for all images in the bingo card to actually load and render
    await waitForImagesToLoad(bingoCard);

    // Generate canvas
    const canvas = await html2canvas(bingoCard, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true, // Enable CORS for proxy images
    });

    // Get data URL
    const dataUrl = canvas.toDataURL('image/png');

    // Store bingo card data in localStorage
    const bingoData = {
      huntId,
      huntName,
      creatorName,
      targetVillager,
      islandVillagerIds: islandVillagers,
      bingoVillagerIds: bingoVillagers.map(v => v.villager_id),
      generatedAt: new Date().toISOString(),
    };
    localStorage.setItem(`bingo_card_${huntId}`, JSON.stringify(bingoData));

    return dataUrl;
  } finally {
    document.body.removeChild(bingoCard);
  }
}