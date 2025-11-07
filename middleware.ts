import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;
  const lowercasedPath = pathname.toLowerCase();

  if (pathname !== lowercasedPath) {
    return NextResponse.redirect(new URL(lowercasedPath, origin));
  }

  return NextResponse.next();
}
