import { NextResponse } from 'next/server';
import type { SessionPayload } from '@/lib/auth-session';
import { getSessionPayloadFromRequest } from './request-session';

export async function requireApiSession(request: Request): Promise<
  | { session: SessionPayload; response?: never }
  | { session?: never; response: NextResponse }
> {
  const session = await getSessionPayloadFromRequest(request);

  if (!session) {
    return {
      response: NextResponse.json(
        { error: 'Vui long dang nhap de su dung API.' },
        { status: 401 },
      ),
    };
  }

  return { session };
}
