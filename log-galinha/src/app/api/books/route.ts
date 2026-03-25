import { NextRequest, NextResponse } from 'next/server';
import { searchExternalBooks, saveBookToDb } from '../../../controllers/bookController';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('search');

    if (!query) {
      return NextResponse.json({ error: 'Missing search query parameter.' }, { status: 400 });
    }

    const result = await searchExternalBooks(query);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode || 400 });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (err: any) {
    console.error('[API/Books] GET Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await saveBookToDb(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode || 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (err: any) {
    console.error('[API/Books] POST Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
