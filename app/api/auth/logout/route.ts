import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const url = new URL(request.url);
	// Redirect back to the site’s origin.
	const response = NextResponse.redirect(url.origin);

	// Set basic cookie deletion options.
	// Adjust these based on how your cookies were set.
	const cookieOptions: { path: string; domain?: string; secure?: boolean } = {
		path: "/"
	};

	// In production (HTTPS) add secure flag.
	if (url.protocol === "https:") {
		cookieOptions.secure = true;
	}

	// If your cookies were set with a domain attribute, include it.
	// Check in your browser what the cookie domain is and update accordingly.
	// For example, if the cookies are set with domain "bajaj-flex-it-out-chi.vercel.app":
	cookieOptions.domain = "bajaj-flex-it-out-chi.vercel.app";

	// Loop over all cookies from the request and delete them with the same options.
	request.cookies.getAll().forEach((cookie) => {
		response.cookies.delete({
			name: cookie.name,
			...cookieOptions,
		});
	});

	return response;
}
