import { NextResponse } from 'next/server';

const BOARD_ID = 'XUeuFFbu';
const API_KEY = process.env.TRELLO_API_KEY;
const TOKEN = process.env.TRELLO_TOKEN;

interface TrelloList {
  id: string;
  name: string;
}

interface TrelloCard {
  id: string;
  name: string;
  idList: string;
}

export async function GET() {
  if (!API_KEY || !TOKEN) {
    return NextResponse.json({ error: 'Trello API credentials not configured' }, { status: 500 });
  }

  try {
    // Fetch lists
    const listsRes = await fetch(`https://api.trello.com/1/boards/${BOARD_ID}/lists?key=${API_KEY}&token=${TOKEN}`);
    if (!listsRes.ok) {
      throw new Error('Failed to fetch lists');
    }
    const lists = await listsRes.json() as TrelloList[];

    // Fetch cards
    const cardsRes = await fetch(`https://api.trello.com/1/boards/${BOARD_ID}/cards?key=${API_KEY}&token=${TOKEN}`);
    if (!cardsRes.ok) {
      throw new Error('Failed to fetch cards');
    }
    const cards = await cardsRes.json() as TrelloCard[];

    // Group cards by list
    const listsMap = lists.reduce((acc: Record<string, string>, list: TrelloList) => {
      acc[list.id] = list.name;
      return acc;
    }, {});

    const groupedCards = lists.reduce((acc: Record<string, TrelloCard[]>, list: TrelloList) => {
      acc[list.name] = cards.filter((card: TrelloCard) => card.idList === list.id);
      return acc;
    }, {});

    return NextResponse.json({ lists: listsMap, cards: groupedCards });
  } catch (error) {
    console.error('Trello API error:', error);
    return NextResponse.json({ error: 'Failed to fetch Trello data' }, { status: 500 });
  }
}