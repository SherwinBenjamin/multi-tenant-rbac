// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import {jwtDecode} from "jwt-decode";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes (auth pages, etc.)
  const publicRoutes = ["/auth/login", "/auth/register", "/api/public"];
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Grab the token from cookies
  const token = request.cookies.get("ACCESS_TOKEN")?.value;
  if (!token) {
    // No token => redirect to login
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    type DecodedJWT = {
      sub: string;  // user ID
      aud: string;  // tenant ID
      role: string; // user role
      exp: number;  // expiration
    };
    const decoded = jwtDecode<DecodedJWT>(token);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      // Token expired => optionally attempt refresh or redirect:
      // For simplicity, redirect to login:
      const resp = NextResponse.redirect(new URL("/auth/login", request.url));
      resp.cookies.delete("ACCESS_TOKEN");
      resp.cookies.delete("REFRESH_TOKEN");
      return resp;
    }

    // Define route -> allowedRoles mapping
    const routeRoleMap: Record<string, string[]> = {
      "/auth/dashboard/tenants": ["superadmin"],
      "/auth/dashboard/users": ["admin", "superadmin"],
      // etc. add more if needed
    };

    // Loop the map to see if the pathname starts with a protected route
    for (const [baseRoute, allowedRoles] of Object.entries(routeRoleMap)) {
      if (pathname.startsWith(baseRoute) && !allowedRoles.includes(decoded.role)) {
        // If user doesn’t match role => redirect
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    return NextResponse.next();
  } catch (err) {
    // If any error decoding => force re-login
    const resp = NextResponse.redirect(new URL("/auth/login", request.url));
    resp.cookies.delete("ACCESS_TOKEN");
    resp.cookies.delete("REFRESH_TOKEN");
    return resp;
  }
}

export const config = {
  matcher: [
    // protect all /dashboard, /profile routes, etc.
    "/auth/dashboard/:path*",
    "/auth/profile/:path*",
  ],
};
