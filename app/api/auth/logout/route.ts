import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const response = NextResponse.redirect(new URL("/", request.url));

	response.cookies.set("next-auth.session-token", "", { expires: new Date(0) });
	response.cookies.set("next-auth.csrf-token", "", { expires: new Date(0) });
	response.cookies.set("next-auth.callback-url", "", { expires: new Date(0) });

	return response;
}

