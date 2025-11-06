import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseMiddlewareClient } from '@/utils/supabase/middleware';

export function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;
  const lowercasedPath = pathname.toLowerCase();

  // Preserve existing lowercase redirect behavior globally
  if (pathname !== lowercasedPath) {
    return NextResponse.redirect(new URL(lowercasedPath, origin));
  }

  // Only initialize Supabase session middleware for the villagerhunt section
  if (lowercasedPath.startsWith('/villagerhunt')) {
    return createSupabaseMiddlewareClient(request);
  }

  return NextResponse.next();
}
