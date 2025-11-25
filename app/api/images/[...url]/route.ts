import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ url: string[] }> }
) {
  try {
    const { url } = await params;
    let path = url.join('/');

    // Fix casing: capitalize the filename (e.g., bones_nh.png -> Bones_NH.png)
    const parts = path.split('/');
    const filename = parts[parts.length - 1];
    if (filename) {
      const [name, ext] = filename.split('.');
      const fixedName = name.replace(/_nh$/, '_NH');
      const capitalizedName = fixedName
        .split('_')
        .map(word => {
          // If word is all uppercase (like NH), keep it as-is
          if (word === word.toUpperCase()) {
            return word;
          }
          // Otherwise, capitalize first letter and lowercase the rest
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join('_');
      parts[parts.length - 1] = `${capitalizedName}.${ext}`;
      path = parts.join('/');
    }

    const imageUrl = `https://dodo.ac/${path}`;

    const response = await fetch(imageUrl);

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status });
    }

    const imageBuffer = await response.arrayBuffer();

    // Return the image with proper CORS headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'image/png',
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}