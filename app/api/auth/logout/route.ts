import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const redirectTo = request.nextUrl.searchParams.get('redirect') || url.origin;
        const response = NextResponse.redirect(redirectTo);

        const hostname = url.hostname;
        const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');
        const domain = isLocalhost ? undefined : getRootDomain(hostname);

        // Base cookie options
        const cookieOptions: {
            path: string;
            domain?: string;
            secure?: boolean;
            httpOnly?: boolean;
            sameSite?: 'strict' | 'lax' | 'none';
            expires?: Date;
        } = {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            expires: new Date(0),
        };

        if (!isLocalhost) {
            cookieOptions.secure = true;
            cookieOptions.sameSite = "strict";
            cookieOptions.domain = domain;
        }

        const cookies = request.cookies.getAll();
        console.log("Attempting to clear cookies:", cookies.map(c => c.name));
        
        for (const cookie of cookies) {
            try {
                response.cookies.delete({
                    name: cookie.name,
                    ...cookieOptions,
                });

                response.cookies.set({
                    name: cookie.name,
                    value: "",
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

function getRootDomain(hostname: string): string {
    if (hostname.includes('vercel.app')) {
        return hostname;
    }
    

    const parts = hostname.split('.');
    if (parts.length > 2) {
        return parts.slice(-2).join('.');
    }
    return hostname;
}