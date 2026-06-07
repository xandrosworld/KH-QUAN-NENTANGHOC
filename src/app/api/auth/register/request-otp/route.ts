import { NextResponse } from 'next/server';
import { requestRegistrationOtp } from '@/lib/server/account-store';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await requestRegistrationOtp({
    name: String(body.name ?? ''),
    email: String(body.email ?? ''),
    password: String(body.password ?? ''),
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, devOtp: result.devOtp });
}
