import { NextRequest, NextResponse } from 'next/server';
import { updateBacklogItemStatus, removeBacklogItem } from '../../../../controllers/backlogController';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await req.json();
    const { status } = body;
    
    if (!status) {
        return NextResponse.json({ error: 'Missing status in request body.' }, { status: 400 });
    }

    const result = await updateBacklogItemStatus(Number(resolvedParams.id), status);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode || 400 });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (err: any) {
    console.error('[API/Backlog/[id]] PATCH Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const result = await removeBacklogItem(Number(resolvedParams.id));

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode || 400 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    console.error('[API/Backlog/[id]] DELETE Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
