import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicRoutes = ["/auth/login", "/auth/register", "/api/public"];
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("ACCESS_TOKEN")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    type DecodedJWT = {
      sub: string;
      aud: string;
      role: string;
      exp: number;
    };
    const decoded = jwtDecode<DecodedJWT>(token);

    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      const resp = NextResponse.redirect(new URL("/auth/login", request.url));
      resp.cookies.delete("ACCESS_TOKEN");
      resp.cookies.delete("REFRESH_TOKEN");
      return resp;
    }

    const routeRoleMap: Record<string, string[]> = {
      "/auth/dashboard/tenants": ["superadmin"],
      "/auth/dashboard/users": ["admin", "superadmin"],
    };

    for (const [baseRoute, allowedRoles] of Object.entries(routeRoleMap)) {
      if (
        pathname.startsWith(baseRoute) &&
        !allowedRoles.includes(decoded.role)
      ) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    return NextResponse.next();
  } catch {
    const resp = NextResponse.redirect(new URL("/auth/login", request.url));
    resp.cookies.delete("ACCESS_TOKEN");
    resp.cookies.delete("REFRESH_TOKEN");
    return resp;
  }
}

export const config = {
  matcher: ["/auth/dashboard/:path*", "/auth/profile/:path*"],
};
