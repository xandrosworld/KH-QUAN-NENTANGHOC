import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth-session';

const protectedApiPrefixes = ['/api/account', '/api/analytics', '/api/imports', '/api/chat'];
const authPages = ['/login', '/register'];

async function hasSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  return Boolean(await verifySessionToken(token));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = await hasSession(request);
  const isDashboard = pathname.startsWith('/dashboard');
  const isProtectedApi = protectedApiPrefixes.some((prefix) => pathname.startsWith(prefix));

  if ((isDashboard || isProtectedApi) && !authenticated) {
    if (isProtectedApi) {
      return NextResponse.json({ error: 'Vui long dang nhap de su dung API.' }, { status: 401 });
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (authPages.includes(pathname) && authenticated) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/dashboard';
    dashboardUrl.search = '';
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
    '/api/account/:path*',
    '/api/analytics/:path*',
    '/api/imports/:path*',
    '/api/chat/:path*',
  ],
};
