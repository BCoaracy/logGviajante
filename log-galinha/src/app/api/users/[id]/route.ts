import { NextRequest, NextResponse } from 'next/server';
import { disableAdminUser, removeAdminUser } from '../../../../controllers/userController';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const keycloakId = resolvedParams.id; // Operating extensively on string-based Keycloak IDs
    
    // Status mutation: disables logic fully inside Keycloak IAM and flags local DB
    const result = await disableAdminUser(keycloakId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode || 400 });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (err: any) {
    console.error('[API/Users/[id]] PATCH Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const keycloakId = resolvedParams.id;
    
    // Total wipeout transaction logic bounds passing
    const result = await removeAdminUser(keycloakId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode || 400 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    console.error('[API/Users/[id]] DELETE Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
