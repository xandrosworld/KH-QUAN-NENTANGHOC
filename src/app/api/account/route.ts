import { NextResponse } from 'next/server';
import { getAdminProfile, updateAdminProfile } from '@/lib/server/account-store';

const MAX_AVATAR_LENGTH = 900_000;

function isValidAvatar(value: unknown) {
  if (value === undefined) return true;
  if (value === null || value === '') return true;
  if (typeof value !== 'string') return false;
  if (value.length > MAX_AVATAR_LENGTH) return false;
  return /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(value);
}

export async function GET() {
  const profile = await getAdminProfile();
  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim();
  const avatarDataUrl = body.avatarDataUrl;

  if (name.length < 2) {
    return NextResponse.json({ error: 'Tên hiển thị cần tối thiểu 2 ký tự.' }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email không hợp lệ.' }, { status: 400 });
  }

  if (!isValidAvatar(avatarDataUrl)) {
    return NextResponse.json({ error: 'Ảnh đại diện không hợp lệ hoặc dung lượng quá lớn.' }, { status: 400 });
  }

  const profile = await updateAdminProfile({
    name,
    email,
    role: 'Admin',
    avatarDataUrl: avatarDataUrl || undefined,
  });

  return NextResponse.json({ profile });
}
