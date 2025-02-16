import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const response = NextResponse.redirect(new URL("/", request.url));
	const cookieOptions = { path: "/" };

	const allCookies = request.cookies.getAll();

	// Loop through each cookie and delete it.
	allCookies.forEach((cookie) => {
		// Delete cookie with the same name and path.
		// Note: If cookies were set with a domain or other attributes,
		// you might need to include those attributes here.
		response.cookies.delete({ name: cookie.name, path: "/" });
	});
	return response;
}
