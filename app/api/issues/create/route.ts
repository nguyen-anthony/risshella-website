import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { type, shortDescription, description, discordUsername } = await request.json();

    if (!type || !shortDescription || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['issue', 'feature'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type. Must be "issue" or "feature"' }, { status: 400 });
    }

    if (shortDescription.length > 50) {
      return NextResponse.json({ error: 'Short description must be 50 characters or less' }, { status: 400 });
    }

    const apiKey = process.env.TRELLO_API_KEY;
    const token = process.env.TRELLO_TOKEN;
    const listId = process.env.TRELLO_LIST_ID;

    if (!apiKey || !token || !listId) {
      return NextResponse.json({ error: 'Trello API not configured' }, { status: 500 });
    }

    const name = `${type === 'issue' ? '🐛 Bug Report' : '✨ Feature Request'}: ${shortDescription}`;
    const desc = `**Type:** ${type === 'issue' ? 'Bug Report' : 'Feature Request'}

**Description:**
${description}

---
*Reported via risshella-website*`;

    const params = new URLSearchParams({
      key: apiKey,
      token: token,
      idList: listId,
      name: name,
      desc: desc,
      pos: 'top', // Add new cards to the top of the list
    });

    const response = await fetch(`https://api.trello.com/1/cards?${params}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Trello API error:', error);
      return NextResponse.json({ error: 'Failed to create card' }, { status: 500 });
    }

    const card = await response.json();

    // Add Discord username as a comment if provided
    if (discordUsername && discordUsername.trim()) {
      const commentParams = new URLSearchParams({
        key: apiKey,
        token: token,
        text: `**Discord Username:** ${discordUsername.trim()}`,
      });

      const commentResponse = await fetch(`https://api.trello.com/1/cards/${card.id}/actions/comments?${commentParams}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!commentResponse.ok) {
        console.warn('Failed to add Discord username comment:', await commentResponse.text());
        // Don't fail the whole request if comment fails
      }
    }

    return NextResponse.json({ success: true, cardId: card.id, cardUrl: card.url });
  } catch (error) {
    console.error('Error creating card:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}