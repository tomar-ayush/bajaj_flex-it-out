import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const response = NextResponse.redirect(new URL("/", request.url));

	// Get the domain from the request URL
	const domain = new URL(request.url).hostname;

	// Common cookie options
	const cookieOptions = {
		expires: new Date(0),
		path: "/",
		secure: process.env.NODE_ENV === "production", // Secure in production only
		sameSite: "lax" as const,
		// Don't set domain for localhost
		...(domain !== "localhost" && { domain: `.${domain}` })
	};

	// Delete all next-auth cookies
	response.cookies.set("next-auth.session-token", "", cookieOptions);
	response.cookies.set("next-auth.csrf-token", "", cookieOptions);
	response.cookies.set("next-auth.callback-url", "", cookieOptions);

	return response;
}
