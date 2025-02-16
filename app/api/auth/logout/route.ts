import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	// Construct the redirect URL (using the request origin)
	const response = NextResponse.redirect(new URL("/", request.url));

	// Define your project domain explicitly for cookie deletion
	const projectDomain = "bajaj-flex-it-out-chi.vercel.app";

	// Retrieve all cookies from the request
	const allCookies = request.cookies.getAll();

	// Delete each cookie with the specified domain and path
	allCookies.forEach((cookie) => {
		response.cookies.delete({
			name: cookie.name,
			path: "/",
			domain: projectDomain,
			secure: true
		});
	});

	request.cookies.delete("__Secure-next-auth.session-token")

	return response;
}
