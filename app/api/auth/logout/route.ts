import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));
  const domain = new URL(request.url).hostname;

  const isVercel = domain.endsWith('.vercel.app');

  const cookieOptions = {
    expires: new Date(0),
    maxAge: 0,
    path: "/",
    secure: true, 
    httpOnly: true,
    sameSite: "lax" as const,
    // Omit the domain attribute on Vercel deployments
    ...(isVercel ? {} : { domain })
  };

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