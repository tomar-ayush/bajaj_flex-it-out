import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const response = NextResponse.redirect(new URL("/", request.url));

	// Get the domain from the request URL
	const domain = new URL(request.url).hostname;

	// Common cookie options
	const cookieOptions = {
		expires: new Date(0),
		path: "/",
		// secure: process.env.NODE_ENV === "production", // Secure in production only
		sameSite: "lax" as const,
		// Don't set domain for localhost
		// ...(domain !== "localhost" && { domain: `.${domain}` })
	};
	/*
	response.cookies.set("__Secure-next-auth.session-token", "", cookieOptions);
	response.cookies.set("__Host-next-auth.csrf-token", "", cookieOptions);
	response.cookies.set("__Secure-next-auth.callback-url", "", cookieOptions);
	response.cookies.set("__Secure-next-auth.pkce.code_verifier", "", cookieOptions);
	response.cookies.set("__Secure-next-auth.state", "", cookieOptions);
	*/

	response.cookies.delete("__Secure-next-auth.session-token")
	response.cookies.delete("__Host-next-auth.csrf-token")
	response.cookies.delete("__Secure-next-auth.pkce.code_verifier")
	response.cookies.delete("__Secure-next-auth.state")
	response.cookies.delete("__Secure-next-auth.callback-url")

	// __Secure-next-auth.session-token



	const preserveCookies = new Set([
		// Add any cookie names you want to preserve
		// Example: "essential-cookie"
		"essentals"
	]);

	// Clear all cookies except those in preserveCookies
	request.cookies.getAll().forEach(cookie => {
		if (!preserveCookies.has(cookie.name)) {
			console.log(cookie);
			response.cookies.set(cookie.name, "", cookieOptions);
		}
	});


	return response;
}
