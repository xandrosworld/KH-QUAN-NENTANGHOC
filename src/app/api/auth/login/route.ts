import { NextResponse } from 'next/server';

const SESSION_COOKIE = 'tronx_session';

function isValidCredential(email: string, password: string) {
  const configuredEmail = process.env.TRONX_ADMIN_EMAIL ?? 'admin@tronx.vn';
  const configuredPassword = process.env.TRONX_ADMIN_PASSWORD ?? 'admin123';
  const normalizedEmail = email.trim().toLowerCase();

  return (
    (normalizedEmail === configuredEmail.toLowerCase() || normalizedEmail === 'admin') &&
    password === configuredPassword
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? '');
  const password = String(body.password ?? '');

  if (!isValidCredential(email, password)) {
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
