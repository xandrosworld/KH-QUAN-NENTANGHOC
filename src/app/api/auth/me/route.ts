import { NextResponse } from 'next/server';
import { getUserProfile } from '@/lib/server/account-store';
import { getSessionPayloadFromRequest } from '@/lib/server/request-session';

export async function GET(request: Request) {
  const session = await getSessionPayloadFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: 'Chua dang nhap.' }, { status: 401 });
  }

  const profile = await getUserProfile(session.sub);
  return NextResponse.json({ profile });
}
