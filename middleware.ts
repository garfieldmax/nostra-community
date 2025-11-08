import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { readSessionFromRequest } from "@/lib/auth/session";

const PUBLIC_PATHS = ["/", "/login", "/_next", "/favicon.ico", "/api/health", "/communities"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await readSessionFromRequest(request);

  if (session) {
    const response = NextResponse.next();
    response.headers.set("x-member-id", session.id);
    return response;
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTHENTICATED", message: "Authentication required" } },
      { status: 401 },
    );
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/(.*)"],
};
