import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("scholrai_session")?.value;
  const path = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicPaths = ["/", "/login", "/signup", "/about"];
  const isPublicPath = publicPaths.some(
    (p) => path === p || path.startsWith("/api/auth"),
  );

  // If accessing protected route without token, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If accessing dashboard routes, we'll let the client-side check handle profile completion
  // This is because we can't easily decode JWT and check database in edge middleware
  // The AuthGuard component will handle the profile completion check

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)"],
};
