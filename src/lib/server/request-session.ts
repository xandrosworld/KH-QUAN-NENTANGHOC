import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth-session';

function parseCookieHeader(cookieHeader: string | null) {
  const cookies = new Map<string, string>();
  if (!cookieHeader) return cookies;

  cookieHeader.split(';').forEach((part) => {
    const [name, ...valueParts] = part.trim().split('=');
    if (!name) return;
    cookies.set(name, decodeURIComponent(valueParts.join('=')));
  });

  return cookies;
}

export async function getSessionPayloadFromRequest(request: Request) {
  const cookies = parseCookieHeader(request.headers.get('cookie'));
  return verifySessionToken(cookies.get(SESSION_COOKIE));
}
