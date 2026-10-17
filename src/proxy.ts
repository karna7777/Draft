import { NextRequest, NextResponse } from "next/server";

// Fast cookie-presence gate for the app pages (Next 16 "proxy" convention).
// The cookie is only validated against the DB inside the route handlers
// (Prisma can't run at the edge), so this just redirects obvious signed-out
// visits without a content flash.
const PROTECTED = ["/projects", "/create", "/editor"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (!needsAuth) return NextResponse.next();

  const hasSession = Boolean(req.cookies.get("draft_session")?.value);
  if (hasSession) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname + (req.nextUrl.search || ""));
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/projects/:path*", "/create/:path*", "/editor/:path*"],
};
