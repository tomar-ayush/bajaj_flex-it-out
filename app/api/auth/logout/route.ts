import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);

    // Allow custom redirect through query parameter (validate as needed)
    const redirectTo = request.nextUrl.searchParams.get("redirect") || url.origin;
    const response = NextResponse.redirect(redirectTo);

    // Define cookie deletion options.
    // (Make sure these match how cookies were originally set.)
    const cookieOptions: {
      path: string;
      domain?: string;
      secure?: boolean;
      httpOnly?: boolean;
      sameSite?: "strict" | "lax" | "none";
    } = {
      path: "/",
      httpOnly: true, // Prevents JS access
      sameSite: "lax", // Default value
    };

    // In production (HTTPS) enforce secure cookies and stricter sameSite policy
    if (url.protocol === "https:") {
      cookieOptions.secure = true;
      cookieOptions.sameSite = "strict";
    }

    // Only add the domain if not running on localhost.
    const hostname = url.hostname;
    if (!hostname.includes("localhost") && !hostname.includes("127.0.0.1")) {
      // Ensure this exactly matches how the cookie was set.
      cookieOptions.domain = hostname;
      console.log("hostname:", hostname);
    }

    console.log("clearing cookies called");
    const cookies = request.cookies.getAll();

    for (const cookie of cookies) {
      try {
        // Dummy set the cookie so it appears in the response cookie map
        response.cookies.set({
          name: cookie.name,
          value: "dummy",
          ...cookieOptions,
        });
        // Then delete the cookie with the same options
        response.cookies.delete({
          name: cookie.name,
          ...cookieOptions,
        });
      } catch (cookieError) {
        console.error(`Failed to delete cookie ${cookie.name}:`, cookieError);
      }
    }

    return response;
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Failed to process logout" }, { status: 500 });
  }
}
