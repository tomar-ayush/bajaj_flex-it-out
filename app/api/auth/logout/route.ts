import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const url = new URL(request.url);

		// Allow custom redirect through query parameter (ensure you validate this if needed)
		const redirectTo = request.nextUrl.searchParams.get('redirect') || url.origin;
		const response = NextResponse.redirect(redirectTo);

		// Set comprehensive cookie deletion options
		const cookieOptions: {
			path: string;
			domain?: string;
			secure?: boolean;
			httpOnly?: boolean;
			sameSite?: 'strict' | 'lax' | 'none';
		} = {
			path: "/",
			httpOnly: true, // Prevents JavaScript access to cookies
			sameSite: "lax", // Default sameSite value
		};

		// In production (HTTPS) enforce secure cookies and adjust sameSite
		if (url.protocol === "https:") {
			cookieOptions.secure = true;
			cookieOptions.sameSite = "strict";
		}

		// Use the full hostname for production cookies
		const hostname = url.hostname;
		if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
			cookieOptions.domain = hostname; // Use the full hostname (e.g., "bajaj-flex-it-out-chi.vercel.app")
			console.log(hostname);
		}

		// Delete all cookies with proper options
		const cookies = request.cookies.getAll();
		for (const cookie of cookies) {
			try {
				response.cookies.delete({
					name: cookie.name,
					...cookieOptions,
				});
			} catch (cookieError) {
				console.error(`Failed to delete cookie ${cookie.name}:`, cookieError);
			}
		}

		return response;
	} catch (error) {
		console.error('Logout error:', error);
		return NextResponse.json(
			{ error: 'Failed to process logout' },
			{ status: 500 }
		);
	}
}

// Optional: Add rate limiting middleware configuration if needed
export const config = {
	api: {
		// externalResolver: true,
	},
};
