import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Protect root (Dashboard), /upload, and API routes that aren't public
  const isDashboard = request.nextUrl.pathname === '/';
  const isUpload = request.nextUrl.pathname.startsWith('/upload');
  const isProtectedApi = request.nextUrl.pathname.startsWith('/api') && 
                         !request.nextUrl.pathname.startsWith('/api/transfer/') && 
                         !request.nextUrl.pathname.startsWith('/api/cron') &&
                         !request.nextUrl.pathname.startsWith('/api/auth'); // allow cron & auth

  if (isDashboard || isUpload || isProtectedApi) {
    const authCookie = request.cookies.get('snaprelay_auth');
    const requiredPassphrase = process.env.DASHBOARD_PASSPHRASE;

    if (!requiredPassphrase) {
        // Warning: Setup incomplete. But block access until they set one
        return new NextResponse("Server configuration incomplete: Passphrase not set", { status: 500 });
    }

    if (authCookie?.value !== requiredPassphrase) {
      // If client requests root dashboard/upload page, Redirect to a ?login query parameter layout view or render a distinct view
      if (!isProtectedApi) {
        const loginUrl = new URL(request.url);
        loginUrl.pathname = '/login'; // Let's build a dedicated login page
        return NextResponse.redirect(loginUrl);
      } else {
        return new NextResponse("Unauthorized", { status: 401 });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - t/ (Transfer access pages)
     * - login (Login page)
     */
    '/((?!_next/static|_next/image|favicon.ico|t/|login).*)',
  ],
};
