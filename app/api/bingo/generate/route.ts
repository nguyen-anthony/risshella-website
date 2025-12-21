import { NextRequest, NextResponse } from 'next/server';
import { registerFont, createCanvas, loadImage } from 'canvas';
import path from 'path';

// Register a font if needed, but for now use default
registerFont(path.join(process.cwd(), 'public/ARIAL.TTF'), { family: 'Arial' });

async function fetchImageBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${url}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function drawImageAspectRatio(ctx: any, img: any, x: number, y: number, width: number, height: number) {
  const imgAspect = img.width / img.height;
  const areaAspect = width / height;

  let drawWidth, drawHeight;

  if (imgAspect > areaAspect) {
    // Image is wider than area - fit by width
    drawWidth = width;
    drawHeight = width / imgAspect;
  } else {
    // Image is taller than area - fit by height
    drawHeight = height;
    drawWidth = height * imgAspect;
  }

  // Center the image in the area
  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;

  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      huntName,
      creatorName,
      targetVillagers,
      bingoVillagers,
      bingoCardSize = 5,
    }: {
      huntId: string;
      huntName: string;
      creatorName: string;
      targetVillagers: { villager_id: number; name: string; image_url: string | null }[];
      bingoVillagers: { villager_id: number; name: string; image_url: string | null }[];
      bingoCardSize?: number;
    } = body;

    if (!bingoVillagers || bingoVillagers.length !== (bingoCardSize * bingoCardSize - (bingoCardSize === 3 || bingoCardSize === 5 ? 1 : 0))) {
      return NextResponse.json({ error: 'Invalid bingo villagers data' }, { status: 400 });
    }

    if (![3, 4, 5].includes(bingoCardSize)) {
      return NextResponse.json({ error: 'Invalid bingo card size' }, { status: 400 });
    }

    // Create canvas
    const canvas = createCanvas(800, 1200);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 800, 1200);

    // Header
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Animal Crossing Villager Hunt', 400, 50);

    ctx.font = '24px sans-serif';
    ctx.fillText(`Hunt: ${huntName}`, 400, 80);
    ctx.fillText(`Creator: ${creatorName}`, 400, 105);

    // Target villagers
    let dreamiesEndY = 140; // Default if no dreamies
    if (targetVillagers.length > 0) {
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('Dreamies:', 400, 150);

      let x = 50;
      let y = 190;
      for (const villager of targetVillagers) {
        if (villager.image_url) {
          try {
            const imageBuffer = await fetchImageBuffer(villager.image_url);
            const img = await loadImage(imageBuffer);

            drawImageAspectRatio(ctx, img, x, y - 25, 32, 32);
          } catch (error) {
            console.error('Failed to load target image:', villager.image_url, error);
          }
        }

        ctx.font = '24px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(villager.name, x + 40, y);

        // Dynamic spacing: image (32px) + text width + padding
        const textWidth = ctx.measureText(villager.name).width;
        const itemWidth = 32 + 40 + textWidth + 20; // image + left padding + text + right padding
        x += Math.max(itemWidth, 120); // Minimum spacing of 120px

        if (x > 700) {
          x = 50;
          y += 40;
        }
      }
      dreamiesEndY = y + 20; // Add some padding after the last row
    }

    // Bingo grid
    const gridStartY = Math.max(dreamiesEndY, 150);
    const gridSize = 700; // Keep the same total grid size
    const cellSize = gridSize / bingoCardSize;
    
    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, gridStartY, gridSize, gridSize);

    // B-I-N-G-O letters (only for 5x5, or adapt for other sizes)
    if (bingoCardSize === 5) {
      ctx.fillStyle = '#2e7d32';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      const letters = ['B', 'I', 'N', 'G', 'O'];
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(50 + i * cellSize, gridStartY, cellSize, 40);
        ctx.fillStyle = 'white';
        ctx.fillText(letters[i], 50 + i * cellSize + cellSize / 2, gridStartY + 28);
        ctx.fillStyle = '#2e7d32';
      }
    } else {
      // For 3x3 and 4x4, just draw a header
      ctx.fillStyle = '#2e7d32';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Villager Hunt Bingo', 400, gridStartY + 30);
    }

    // Bingo squares
    let villagerIndex = 0;
    for (let row = 0; row < bingoCardSize; row++) {
      for (let col = 0; col < bingoCardSize; col++) {
        const x = 50 + col * cellSize;
        const y = gridStartY + (bingoCardSize === 5 ? 40 : 50) + row * cellSize;

        // Check if this is a free space
        const isFreeSpace = (bingoCardSize === 3 || bingoCardSize === 5) && row === Math.floor(bingoCardSize / 2) && col === Math.floor(bingoCardSize / 2);

        if (isFreeSpace) {
          // Center free square
          ctx.fillStyle = '#e8f5e8';
          ctx.fillRect(x, y, cellSize, cellSize);
          ctx.strokeRect(x, y, cellSize, cellSize);
          ctx.fillStyle = '#000000';
          ctx.font = `bold ${Math.max(16, cellSize / 5)}px sans-serif`; // Scale font size
          ctx.textAlign = 'center';
          ctx.fillText('FREE', x + cellSize / 2, y + cellSize * 0.4);
          ctx.font = `${Math.max(12, cellSize / 7)}px sans-serif`; // Smaller font for subtitle
          ctx.fillText('Villager Hunt', x + cellSize / 2, y + cellSize * 0.55);
        } else {
          ctx.fillStyle = 'white';
          ctx.fillRect(x, y, cellSize, cellSize);
          ctx.strokeRect(x, y, cellSize, cellSize);

          const villager = bingoVillagers[villagerIndex++];

          // Calculate image and text positioning
          const imageWidth = Math.min(cellSize * 0.7, 120); // Image takes up 70% of cell width, max 120px
          const imageHeight = imageWidth * 0.8; // Maintain aspect ratio
          const imageX = x + (cellSize - imageWidth) / 2; // Center horizontally
          const imageY = y + cellSize * 0.12; // Position in upper 12% of cell

          if (villager?.image_url) {
            try {
              const imageBuffer = await fetchImageBuffer(villager.image_url);
              const img = await loadImage(imageBuffer);

              drawImageAspectRatio(ctx, img, imageX, imageY, imageWidth, imageHeight);
            } catch (error) {
              console.error('Failed to load bingo image:', villager.image_url, error);
            }
          }

          // Position text below the image
          ctx.fillStyle = '#000000';
          ctx.font = `bold ${Math.max(12, Math.min(24, cellSize / 6))}px sans-serif`; // Scale font size, max 24px, min 12px
          ctx.textAlign = 'center';
          const textY = imageY + imageHeight + cellSize * 0.2; // Position below image with some padding
          ctx.fillText(villager?.name || 'Unknown', x + cellSize / 2, textY);
        }
      }
    }

    // Get PNG buffer
    const buffer = canvas.toBuffer('image/png');

    // Store bingo data in a way, but since server-side, perhaps return the image
    // For now, just return the image

    // Convert Node Buffer to Uint8Array to satisfy BodyInit/ArrayBufferView typing
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error generating bingo card:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}