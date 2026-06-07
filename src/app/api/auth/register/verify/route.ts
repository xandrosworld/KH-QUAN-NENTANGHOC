import { NextResponse } from 'next/server';
import { verifyRegistrationOtp } from '@/lib/server/account-store';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? '');
  const otp = String(body.otp ?? '');

  if (!email || !otp) {
    return NextResponse.json({ error: 'Vui long nhap email va ma OTP.' }, { status: 400 });
  }

  const result = await verifyRegistrationOtp(email, otp);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, profile: result.profile });
}
