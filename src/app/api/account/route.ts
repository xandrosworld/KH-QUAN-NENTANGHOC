import { NextResponse } from 'next/server';
import { getUserProfile, updateUserProfile } from '@/lib/server/account-store';
import { getSessionPayloadFromRequest } from '@/lib/server/request-session';

const MAX_AVATAR_LENGTH = 900_000;

function isValidAvatar(value: unknown) {
  if (value === undefined) return true;
  if (value === null || value === '') return true;
  if (typeof value !== 'string') return false;
  if (value.length > MAX_AVATAR_LENGTH) return false;
  return /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(value);
}

export async function GET(request: Request) {
  const session = await getSessionPayloadFromRequest(request);
  const profile = await getUserProfile(session?.sub);
  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const session = await getSessionPayloadFromRequest(request);
  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim();
  const avatarDataUrl = body.avatarDataUrl;

  if (name.length < 2) {
    return NextResponse.json({ error: 'Ten hien thi can toi thieu 2 ky tu.' }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email khong hop le.' }, { status: 400 });
  }

  if (!isValidAvatar(avatarDataUrl)) {
    return NextResponse.json({ error: 'Anh dai dien khong hop le hoac dung luong qua lon.' }, { status: 400 });
  }

  const profile = await updateUserProfile(session?.sub, {
    name,
    email,
    role: 'Admin',
    avatarDataUrl: avatarDataUrl || undefined,
  });

  return NextResponse.json({ profile });
}
