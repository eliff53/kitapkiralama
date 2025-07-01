import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Giriş gerektirmeyen sayfalar
const publicPages = ['/', '/login', '/register'];

// Admin gerektiren sayfalar
const adminPages = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // API route'ları middleware'den hariç tut
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Cookie'den token'ı al
  const token = request.cookies.get('token')?.value;
  
  // Public sayfalar için kontrol yapma
  if (publicPages.includes(pathname)) {
    return NextResponse.next();
  }

  // Giriş yapmamış kullanıcıları login'e yönlendir
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token varsa sayfaya erişim ver
  return NextResponse.next();
}

// Middleware'in çalışacağı sayfaları belirt
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 