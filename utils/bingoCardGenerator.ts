import html2canvas from 'html2canvas';

type Villager = {
  villager_id: number;
  name: string;
  image_url: string | null;
};

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
  targetVillagers,
  bingoVillagers,
}: {
  huntName: string;
  creatorName: string;
  targetVillagers: { name: string; image_url: string | null }[];
  bingoVillagers: Villager[];
}) {
  const container = document.createElement('div');
  container.style.width = '800px';
  container.style.padding = '20px';
  container.style.backgroundColor = '#ffffff';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.alignItems = 'center';
  container.style.color = '#000000'; // Ensure all text is black by default

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
  huntInfo.style.color = '#000000'; // Explicit black for hunt info text
  huntInfo.innerHTML = `
    <strong>Hunt:</strong> ${huntName}<br>
    <strong>Creator:</strong> ${creatorName}
  `;

  if (targetVillagers.length > 0) {
    const targetInfo = document.createElement('div');
    targetInfo.style.display = 'flex';
    targetInfo.style.flexDirection = 'column';
    targetInfo.style.gap = '8px';
    targetInfo.style.fontSize = '16px';

    const targetLabel = document.createElement('strong');
    targetLabel.textContent = 'Dreamies:';
    targetLabel.style.color = '#000000'; // Explicit black for target label

    targetInfo.appendChild(targetLabel);

    const dreamiesContainer = document.createElement('div');
    dreamiesContainer.style.display = 'flex';
    dreamiesContainer.style.flexWrap = 'wrap';
    dreamiesContainer.style.gap = '8px';

    targetVillagers.forEach(villager => {
      const villagerDiv = document.createElement('div');
      villagerDiv.style.display = 'flex';
      villagerDiv.style.alignItems = 'center';
      villagerDiv.style.gap = '4px';

      const villagerImg = document.createElement('img');
      villagerImg.src = villager.image_url || '/placeholder.png';
      villagerImg.alt = villager.name;
      villagerImg.style.width = 'auto';
      villagerImg.style.height = 'auto';
      villagerImg.style.maxWidth = '24px';
      villagerImg.style.maxHeight = '24px';
      villagerImg.style.borderRadius = '4px';

      const villagerName = document.createElement('span');
      villagerName.textContent = villager.name;
      villagerName.style.fontSize = '14px';
      villagerName.style.color = '#000000'; // Explicit black for villager names

      villagerDiv.appendChild(villagerImg);
      villagerDiv.appendChild(villagerName);
      dreamiesContainer.appendChild(villagerDiv);
    });

    targetInfo.appendChild(dreamiesContainer);
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
      subText.style.color = '#000000'; // Explicit black for subtext
      cell.appendChild(subText);
    } else {
      const villagerIndex = i < 12 ? i : i - 1; // Skip center
      const villager = bingoVillagers[villagerIndex];

      if (villager?.image_url) {
        const img = document.createElement('img');
        img.src = villager.image_url;
        img.alt = villager.name;
        img.style.width = 'auto';
        img.style.height = 'auto';
        img.style.maxWidth = '48px';
        img.style.maxHeight = '48px';
        img.style.borderRadius = '4px';
        img.style.marginBottom = '4px';
        cell.appendChild(img);
      }

      const name = document.createElement('div');
      name.textContent = villager?.name || 'Unknown';
      name.style.fontSize = '12px';
      name.style.fontWeight = 'bold';
      name.style.color = '#000000'; // Explicit black for bingo square names
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
  targetVillagers,
  islandVillagers,
  villagers,
}: {
  huntId: string;
  huntName: string;
  creatorName: string;
  targetVillagers: { villager_id: number; name: string; image_url: string | null }[];
  islandVillagers: number[];
  villagers: Villager[];
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

  // Create bingo card HTML with local image URLs
  const bingoCard = createBingoCardHTML({
    huntName,
    creatorName,
    targetVillagers,
    bingoVillagers,
  });

  // Temporarily add to DOM (hidden off-screen to prevent flash)
  bingoCard.style.position = 'fixed';
  bingoCard.style.left = '-9999px';
  bingoCard.style.top = '-9999px';
  bingoCard.style.zIndex = '-1';
  document.body.appendChild(bingoCard);

  try {
    // Wait for all images in the bingo card to actually load and render
    await waitForImagesToLoad(bingoCard);

    // Generate canvas
    const canvas = await html2canvas(bingoCard, {
      backgroundColor: '#ffffff',
      scale: 2,
    });

    // Get data URL
    const dataUrl = canvas.toDataURL('image/png');

    // Store bingo card data in localStorage
    const bingoData = {
      huntId,
      huntName,
      creatorName,
      targetVillagers,
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