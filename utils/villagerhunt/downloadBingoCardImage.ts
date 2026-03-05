import type { Villager } from '@/types/villagerhunt';

const CELL_SIZE = 140;
const GAP = 6;
const TITLE_HEIGHT = 56;
const PADDING = 16;

// Colours (light-mode palette matching the interactive card)
const COLOURS = {
  background: '#ffffff',
  cellBg: '#ffffff',
  cellBorder: '#e0e0e0',
  markedBg: '#81c784',   // success.light
  freeBg: '#81c784',
  text: '#1a1a1a',
  markedText: '#1b5e20', // darker green for contrast
  titleText: '#1a1a1a',
  checkmark: '#2e7d32',  // success.main
};

/** Route image URLs through Next.js's built-in image optimizer (same-origin → no canvas CORS issues). */
function toProxiedUrl(src: string): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=256&q=90`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = toProxiedUrl(src);
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.arcTo(x + w, y, x + w, y + radius, radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
  ctx.lineTo(x + radius, y + h);
  ctx.arcTo(x, y + h, x, y + h - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

type Options = {
  villagers: Villager[];
  villagerIds: number[];
  markedSquares: boolean[];
  size: number;
  title?: string;
};

export async function downloadBingoCardImage({
  villagers,
  villagerIds,
  markedSquares,
  size,
  title = 'Bingo Card',
}: Options): Promise<void> {
  const villagerMap = new Map<number, Villager>();
  villagers.forEach(v => villagerMap.set(v.villager_id, v));

  const hasFreeSpace = size === 3 || size === 5;
  const freeSpaceIndex = hasFreeSpace ? Math.floor((size * size) / 2) : -1;

  const gridPx = size * CELL_SIZE + (size - 1) * GAP;
  const canvasW = gridPx + PADDING * 2;
  const canvasH = gridPx + PADDING * 2 + TITLE_HEIGHT;

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;

  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = COLOURS.background;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Title
  ctx.fillStyle = COLOURS.titleText;
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, canvasW / 2, PADDING + 26);

  // Pre-load all images that we need (ignore failures)
  const imageCache = new Map<string, HTMLImageElement>();
  await Promise.all(
    villagerIds.map(async (id) => {
      const v = villagerMap.get(id);
      if (!v?.image_url || imageCache.has(v.image_url)) return;
      try {
        const img = await loadImage(v.image_url);
        imageCache.set(v.image_url, img);
      } catch {
        // silently skip — cell will render without image
      }
    })
  );

  // Draw cells
  for (let index = 0; index < size * size; index++) {
    const col = index % size;
    const row = Math.floor(index / size);
    const x = PADDING + col * (CELL_SIZE + GAP);
    const y = PADDING + TITLE_HEIGHT + row * (CELL_SIZE + GAP);

    const isFreeSpace = index === freeSpaceIndex;
    const isMarked = markedSquares[index];
    const cellBg = isFreeSpace || isMarked ? COLOURS.markedBg : COLOURS.cellBg;

    // Cell background
    ctx.fillStyle = cellBg;
    roundRect(ctx, x, y, CELL_SIZE, CELL_SIZE, 8);
    ctx.fill();

    // Cell border
    ctx.strokeStyle = COLOURS.cellBorder;
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, CELL_SIZE, CELL_SIZE, 8);
    ctx.stroke();

    if (isFreeSpace) {
      ctx.fillStyle = COLOURS.markedText;
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('FREE', x + CELL_SIZE / 2, y + CELL_SIZE / 2);
      ctx.textBaseline = 'alphabetic';
      continue;
    }

    // Determine villager index (accounting for free space offset)
    let villagerIndex = index;
    if (hasFreeSpace && index > freeSpaceIndex) {
      villagerIndex = index - 1;
    }

    const villagerId = villagerIds[villagerIndex];
    const villager = villagerMap.get(villagerId);

    if (!villager) continue;

    // Villager image (upper ~60% of cell)
    const imgSize = Math.round(CELL_SIZE * 0.58);
    const imgX = x + (CELL_SIZE - imgSize) / 2;
    const imgY = y + 8;

    if (villager.image_url && imageCache.has(villager.image_url)) {
      const img = imageCache.get(villager.image_url)!;
      // Contain-fit: preserve natural aspect ratio within the square imgSize × imgSize area
      const naturalRatio = img.naturalWidth / img.naturalHeight;
      let drawW = imgSize;
      let drawH = imgSize;
      if (naturalRatio > 1) {
        drawH = imgSize / naturalRatio;
      } else {
        drawW = imgSize * naturalRatio;
      }
      const drawX = imgX + (imgSize - drawW) / 2;
      const drawY = imgY + (imgSize - drawH) / 2;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    } else {
      // Placeholder circle
      ctx.fillStyle = '#bdbdbd';
      ctx.beginPath();
      ctx.arc(x + CELL_SIZE / 2, imgY + imgSize / 2, imgSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Villager name
    const nameY = imgY + imgSize + 6;
    const availableNameHeight = y + CELL_SIZE - nameY - 4;
    ctx.fillStyle = isMarked ? COLOURS.markedText : COLOURS.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const name = villager.name;
    const fontSize = size === 5 ? 11 : size === 4 ? 12 : 14;
    ctx.font = `${isMarked ? 'bold ' : ''}${fontSize}px sans-serif`;

    // Wrap name if needed
    const maxWidth = CELL_SIZE - 8;
    const words = name.split(' ');
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);

    const lineHeight = fontSize + 2;
    const totalTextHeight = lines.length * lineHeight;
    const textStartY = nameY + Math.max(0, (availableNameHeight - totalTextHeight) / 2);
    lines.forEach((line, i) => {
      ctx.fillText(line, x + CELL_SIZE / 2, textStartY + i * lineHeight, maxWidth);
    });

    // Checkmark for marked squares
    if (isMarked) {
      const ckSize = size === 5 ? 18 : 22;
      const ckX = x + CELL_SIZE - ckSize - 4;
      const ckY = y + 4;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ckX + ckSize / 2, ckY + ckSize / 2, ckSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = COLOURS.checkmark;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(ckX + ckSize * 0.2, ckY + ckSize * 0.5);
      ctx.lineTo(ckX + ckSize * 0.45, ckY + ckSize * 0.75);
      ctx.lineTo(ckX + ckSize * 0.8, ckY + ckSize * 0.25);
      ctx.stroke();
    }
  }

  ctx.textBaseline = 'alphabetic';

  // Trigger download
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${title.replace(/\s+/g, '-').toLowerCase()}-bingo.png`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}
