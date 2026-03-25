import { NextRequest, NextResponse } from 'next/server';
import { addBacklogItem, getUserBacklog } from '../../../controllers/backlogController';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await addBacklogItem(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode || 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (err: any) {
    console.error('[API/Backlog] POST Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId query parameter.' }, { status: 400 });
    }

    const result = await getUserBacklog(Number(userId));

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode || 400 });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (err: any) {
    console.error('[API/Backlog] GET Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
