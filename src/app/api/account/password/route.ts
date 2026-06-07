import { NextResponse } from 'next/server';
import { changeAdminPassword } from '@/lib/server/account-store';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const currentPassword = String(body.currentPassword ?? '');
  const newPassword = String(body.newPassword ?? '');
  const confirmPassword = String(body.confirmPassword ?? '');

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json({ error: 'Vui lòng nhập đủ thông tin đổi mật khẩu.' }, { status: 400 });
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: 'Mật khẩu xác nhận không khớp.' }, { status: 400 });
  }

  const result = await changeAdminPassword(currentPassword, newPassword);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
