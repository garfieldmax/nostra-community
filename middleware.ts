import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { optionalMember } from "@/lib/auth/privy";
import { AppError } from "@/lib/errors";

const PUBLIC_PATHS = ["/", "/login", "/_next", "/favicon.ico", "/api/health", "/communities"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  try {
    const auth = await optionalMember(request);
    const response = NextResponse.next();
    if (auth) {
      response.headers.set("x-member-id", auth.memberId);
      return response;
    }

    if (isPublicPath(pathname)) {
      return response;
    }

    // No authenticated member and non-public path
    throw new AppError("Missing Privy token", "UNAUTHENTICATED");
  } catch (error) {
    if (pathname.startsWith("/api")) {
      const status = error instanceof AppError && error.code === "UNAUTHENTICATED" ? 401 : 500;
      const message = error instanceof Error ? error.message : "Authentication failed";
      return NextResponse.json({ ok: false, error: { code: "UNAUTHENTICATED", message } }, { status });
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/(.*)"]
};
