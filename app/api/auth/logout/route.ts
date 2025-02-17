import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const redirectTo = request.nextUrl.searchParams.get('redirect') || url.origin;
        const response = NextResponse.redirect(redirectTo);

        const hostname = url.hostname; // bajaj-flex-it-out.vercel.app
        console.log("Current hostname:", hostname);

        // Get all cookies and log them
        const cookies = request.cookies.getAll();
        console.log("Cookies before deletion:", cookies);

        // Define multiple domain variations to try
        const domainVariations = [
            undefined, // Let browser set automatically
            hostname, // Full hostname
            `.${hostname}`, // With leading dot
            'vercel.app', // Root domain
            `.vercel.app`, // Root domain with leading dot
        ];

        // Cookie paths to try
        const pathVariations = ['/', '/api', ''];

        // For each cookie, try all domain and path combinations
        for (const cookie of cookies) {
            console.log(`Attempting to delete cookie: ${cookie.name}`);

            for (const domain of domainVariations) {
                for (const path of pathVariations) {
                    try {
                        const cookieOptions = {
                            name: cookie.name,
                            value: "",
                            path,
                            domain,
                            expires: new Date(0),
                            httpOnly: true,
                            secure: true,
                            sameSite: "strict" as const,
                        };

                        // Try both deletion methods
                        response.cookies.delete({
                            name: cookie.name,
                            path,
                            domain,
                        });

                        response.cookies.set(cookieOptions);

                        console.log(`Attempted to clear cookie ${cookie.name} with:`, {
                            domain,
                            path
                        });
                    } catch (err) {
                        console.error(`Failed to delete cookie ${cookie.name} with domain ${domain} and path ${path}:`, err);
                    }
                }
            }

            // Also try clearing with minimal options
            try {
                response.cookies.set({
                    name: cookie.name,
                    value: "",
                    expires: new Date(0),
                });
            } catch (err) {
                console.error(`Failed to delete cookie ${cookie.name} with minimal options:`, err);
            }
        }

        // Set Cache-Control header to prevent caching
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Failed to process logout' },
            { status: 500 }
        );
    }
}