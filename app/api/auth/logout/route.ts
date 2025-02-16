import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const url = new URL(request.url);

		// Allow custom redirect through query parameter
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
			sameSite: "lax", // Protects against CSRF
		};

		// In production (HTTPS) add secure flag
		if (url.protocol === "https:") {
			cookieOptions.secure = true;
			cookieOptions.sameSite = "strict";
		}

		// Dynamically determine domain based on environment
		const hostname = url.hostname;
		if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
			// Extract root domain for production
			const domainParts = hostname.split('.');
			if (domainParts.length > 2) {
				// Handle subdomains by using the main domain
				cookieOptions.domain = domainParts.slice(-2).join('.');
			} else {
				cookieOptions.domain = hostname;
			}
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
		// Return a proper error response
		return NextResponse.json(
			{ error: 'Failed to process logout' },
			{ status: 500 }
		);
	}
}

// Optional: Add rate limiting middleware
export const config = {
	api: {
		// Optionally add rate limiting configuration
		// externalResolver: true,
	},
};
