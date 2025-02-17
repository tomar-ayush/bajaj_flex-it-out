import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));
  const domain = new URL(request.url).hostname;

  // Determine if we're on a Vercel deployment
  const isVercel = domain.endsWith('.vercel.app');

  // Common cookie options for deletion
  const cookieOptions = {
    expires: new Date(0),
    maxAge: 0,
    path: "/",
    secure: true, // Always secure since Vercel uses HTTPS
    httpOnly: true,
    sameSite: "lax" as const,
    ...(isVercel ? { domain: '.vercel.app' } : {}) // Set domain for all Vercel subdomains
  };

  // Explicitly delete the session cookie with specific options
  response.cookies.set('__Secure-next-auth.session-token', '', {
    ...cookieOptions,
    path: '/',
  });

  // Delete all other cookies except preserved ones
  const preserveCookies = new Set(["essentials"]);

  request.cookies.getAll().forEach(cookie => {
    if (!preserveCookies.has(cookie.name)) {
      response.cookies.set(cookie.name, "", cookieOptions);
    }
  });

  return response;
}
