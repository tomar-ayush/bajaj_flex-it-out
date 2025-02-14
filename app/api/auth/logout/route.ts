import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	// Create a response that redirects the user (e.g., to the homepage)
	const response = NextResponse.redirect(new URL("/", request.url));
	console.log("This is logout ")

	// Clear the authentication cookie (replace 'token' with your cookie name)
	response.cookies.set("next-auth.session-token", "", { expires: new Date(0) });
	response.cookies.set("next-auth.csrf-token", "", { expires: new Date(0) });
	response.cookies.set("next-auth.callback-url", "", { expires: new Date(0) });

	return response;
}

