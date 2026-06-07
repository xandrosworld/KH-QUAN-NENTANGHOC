import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'tronx_session';
const protectedApiPrefixes = ['/api/account', '/api/analytics', '/api/imports', '/api/chat'];

function hasSession(request: NextRequest) {
  return request.cookies.get(SESSION_COOKIE)?.value === 'phase1-admin';
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = hasSession(request);
  const isDashboard = pathname.startsWith('/dashboard');
  const isProtectedApi = protectedApiPrefixes.some((prefix) => pathname.startsWith(prefix));

  if ((isDashboard || isProtectedApi) && !authenticated) {
    if (isProtectedApi) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập để sử dụng API.' }, { status: 401 });
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === '/login' && authenticated) {
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
    '/api/account/:path*',
    '/api/analytics/:path*',
    '/api/imports/:path*',
    '/api/chat/:path*',
  ],
};
