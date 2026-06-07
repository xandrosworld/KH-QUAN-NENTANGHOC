import { NextResponse } from 'next/server';
import { verifyAdminCredential } from '@/lib/server/account-store';

const SESSION_COOKIE = 'tronx_session';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? '');
  const password = String(body.password ?? '');

  if (!(await verifyAdminCredential(email, password))) {
    return NextResponse.json({ error: 'Email hoặc mật khẩu không đúng.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: 'phase1-admin',
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  });

  return response;
}
