import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseMiddlewareClient } from '@/utils/supabase/middleware';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const lowercasedPath = pathname.toLowerCase();

  // Preserve existing lowercase redirect behavior globally
  if (pathname !== lowercasedPath) {
    // Preserve existing search params while normalizing the path to lowercase
    const url = request.nextUrl.clone();
    url.pathname = lowercasedPath;
    return NextResponse.redirect(url);
  }

  // Only initialize Supabase session middleware for the villagerhunt section
  if (lowercasedPath.startsWith('/villagerhunt')) {
    return createSupabaseMiddlewareClient(request);
  }

  return NextResponse.next();
}
