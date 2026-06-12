import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  const path = request.nextUrl.pathname;

  const isPublicPath = path === '/login' || path === '/signup' || path === '/';

  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/browse', request.nextUrl));
  }

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/signup',
    '/browse',
    '/mylist',
    '/search',
  ]
}
