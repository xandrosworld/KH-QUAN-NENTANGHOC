import { NextResponse } from 'next/server';
import { changeAdminPassword } from '@/lib/server/account-store';
import { requireApiSession } from '@/lib/server/api-auth';

export async function POST(request: Request) {
  const auth = await requireApiSession(request);
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => ({}));
  const currentPassword = String(body.currentPassword ?? '');
  const newPassword = String(body.newPassword ?? '');
  const confirmPassword = String(body.confirmPassword ?? '');

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json({ error: 'Vui long nhap du thong tin doi mat khau.' }, { status: 400 });
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: 'Mat khau xac nhan khong khop.' }, { status: 400 });
  }

  const result = await changeAdminPassword(currentPassword, newPassword, auth.session.sub);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
