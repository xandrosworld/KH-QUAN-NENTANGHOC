import { NextResponse } from 'next/server';
import { getUserProfile, updateUserProfile } from '@/lib/server/account-store';
import { requireApiSession } from '@/lib/server/api-auth';

const MAX_AVATAR_LENGTH = 900_000;

function isValidAvatar(value: unknown) {
  if (value === undefined) return true;
  if (value === null || value === '') return true;
  if (typeof value !== 'string') return false;
  if (value.length > MAX_AVATAR_LENGTH) return false;
  return /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(value);
}

export async function GET(request: Request) {
  const auth = await requireApiSession(request);
  if (auth.response) return auth.response;

  const profile = await getUserProfile(auth.session.sub);
  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const auth = await requireApiSession(request);
  if (auth.response) return auth.response;

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

  let profile;
  try {
    profile = await updateUserProfile(auth.session.sub, {
      name,
      email,
      avatarDataUrl: avatarDataUrl || undefined,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Khong luu duoc ho so.' },
      { status: 400 },
    );
  }

  return NextResponse.json({ profile });
}
