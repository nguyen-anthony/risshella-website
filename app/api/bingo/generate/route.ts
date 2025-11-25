import { NextRequest, NextResponse } from 'next/server';
import { createCanvas, loadImage } from 'canvas';

// Register a font if needed, but for now use default
// registerFont('path/to/font.ttf', { family: 'Arial' });

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
    }: {
      huntId: string;
      huntName: string;
      creatorName: string;
      targetVillagers: { villager_id: number; name: string; image_url: string | null }[];
      bingoVillagers: { villager_id: number; name: string; image_url: string | null }[];
    } = body;

    if (!bingoVillagers || bingoVillagers.length !== 24) {
      return NextResponse.json({ error: 'Invalid bingo villagers data' }, { status: 400 });
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
    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, gridStartY, 700, 700);

    // B-I-N-G-O letters
    ctx.fillStyle = '#2e7d32';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    const letters = ['B', 'I', 'N', 'G', 'O'];
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(50 + i * 140, gridStartY, 140, 40);
      ctx.fillStyle = 'white';
      ctx.fillText(letters[i], 50 + i * 140 + 70, gridStartY + 28);
      ctx.fillStyle = '#2e7d32';
    }

    // Bingo squares
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const x = 50 + col * 140;
        const y = gridStartY + 40 + row * 140;

        if (row === 2 && col === 2) {
          // Center free square
          ctx.fillStyle = '#e8f5e8';
          ctx.fillRect(x, y, 140, 140);
          ctx.strokeRect(x, y, 140, 140);
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 18px sans-serif';
          ctx.fillText('FREE', x + 70, y + 70);
          ctx.font = '20px sans-serif';
          ctx.fillText('Villager Hunt', x + 70, y + 90);
        } else {
          ctx.fillStyle = 'white';
          ctx.fillRect(x, y, 140, 140);
          ctx.strokeRect(x, y, 140, 140);

          const villagerIndex = row * 5 + col - (row * 5 + col > 12 ? 1 : 0);
          const villager = bingoVillagers[villagerIndex];

          if (villager?.image_url) {
            try {
              const imageBuffer = await fetchImageBuffer(villager.image_url);
              const img = await loadImage(imageBuffer);

              drawImageAspectRatio(ctx, img, x + 25, y + 25, 90, 70);
            } catch (error) {
              console.error('Failed to load bingo image:', villager.image_url, error);
            }
          }

          ctx.fillStyle = '#000000';
          ctx.font = 'bold 20px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(villager?.name || 'Unknown', x + 70, y + 120);
        }
      }
    }

    // Get PNG buffer
    const buffer = canvas.toBuffer('image/png');

    // Store bingo data in a way, but since server-side, perhaps return the image
    // For now, just return the image

    return new NextResponse(buffer, {
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