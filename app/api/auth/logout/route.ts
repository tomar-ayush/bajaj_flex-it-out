// app/api/logout/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // Adjust the redirect URL as needed:
  const redirectUrl = new URL('/', 'https://bajaj-flex-it-out.vercel.app');
  const response = NextResponse.redirect(redirectUrl);

  // Manually expire the cookie by sending a Set-Cookie header.
  // Ensure these attributes match exactly how the cookie was set.
  response.headers.append(
    'Set-Cookie',
    'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict'
  );

  return response;
}