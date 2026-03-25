import { NextRequest, NextResponse } from 'next/server';
import { getMovieById, updateMovie, deleteMovieById } from '../../../../controllers/movieController';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const result = await getMovieById(Number(resolvedParams.id));

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode || 400 });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (err: any) {
    console.error('[API/Movies/[id]] GET Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await req.json();
    const result = await updateMovie(Number(resolvedParams.id), body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode || 400 });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (err: any) {
    console.error('[API/Movies/[id]] PATCH Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const result = await deleteMovieById(Number(resolvedParams.id));

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode || 400 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    console.error('[API/Movies/[id]] DELETE Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
