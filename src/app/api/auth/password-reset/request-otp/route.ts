import { NextResponse } from 'next/server';
import { requestPasswordResetOtp } from '@/lib/server/account-store';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? '');
  const result = await requestPasswordResetOtp(email);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, devOtp: result.devOtp });
}
