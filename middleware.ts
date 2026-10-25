import { NextResponse, type NextRequest } from 'next/server';

/**
 * Blocks the admin area at the edge before any page renders.
 *
 * This only checks that a session cookie is *present* — verifying the JWT needs
 * the Node runtime, which middleware does not have. Every admin page and Server
 * Action therefore re-checks the real session (`auth()` / `requireStaff()`).
 * Middleware is the fast redirect for signed-out visitors, not the access
 * control itself.
 */
const SESSION_COOKIES = ['authjs.session-token', '__Secure-authjs.session-token'];

export function middleware(request: NextRequest) {
  const hasSessionCookie = SESSION_COOKIES.some((name) => request.cookies.has(name));

  if (!hasSessionCookie) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Everything under /admin except the login page itself.
  matcher: ['/admin((?!/login).*)'],
};
