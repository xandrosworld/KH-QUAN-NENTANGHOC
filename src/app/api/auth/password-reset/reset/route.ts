import { NextResponse } from 'next/server';
import { resetPasswordWithOtp } from '@/lib/server/account-store';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? '');
  const otp = String(body.otp ?? '');
  const newPassword = String(body.newPassword ?? '');
  const confirmPassword = String(body.confirmPassword ?? '');

  if (!email || !otp || !newPassword || !confirmPassword) {
    return NextResponse.json({ error: 'Vui long nhap day du thong tin.' }, { status: 400 });
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: 'Mat khau xac nhan khong khop.' }, { status: 400 });
  }

  const result = await resetPasswordWithOtp(email, otp, newPassword);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
