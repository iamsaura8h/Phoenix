import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // Public routes
  const publicPaths = ["/login"];

  // If path is public → allow access
  if (publicPaths.includes(url.pathname)) {
    return NextResponse.next();
  }

  // Get user from localStorage is not possible here (runs server-side)
  // Instead, we rely on cookie or header (for future auth tokens)
  // But for now, we check a fallback client cookie (to be added later)
  const userCookie = req.cookies.get("phoenix_user");

  if (!userCookie) {
    // Redirect to login
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Otherwise → allow
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
