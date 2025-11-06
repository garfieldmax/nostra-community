import { cookies, headers } from "next/headers";
import { AppError } from "@/lib/errors";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;

if (!PRIVY_APP_ID) {
  throw new Error("NEXT_PUBLIC_PRIVY_APP_ID is not configured");
}

if (!PRIVY_APP_SECRET) {
  throw new Error("PRIVY_APP_SECRET is not configured");
}

type PrivySession = {
  id: string;
};

const tokenCache = new Map<string, { memberId: string; expiresAt: number }>();
const CACHE_MS = 5 * 60 * 1000;

async function extractToken(request?: Request): Promise<string | null> {
  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      return authHeader.slice(7);
    }
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      for (const candidate of [
        "privy-access-token",
        "privy_access_token",
        "privy-token",
        "_privy_tk",
        "_privy_refresh_token",
      ]) {
        const match = cookieHeader
          .split(";")
          .map((part) => part.trim())
          .find((part) => part.startsWith(`${candidate}=`));
        if (match) {
          return decodeURIComponent(match.split("=")[1] ?? "");
        }
      }
    }
  }

  const headersList = request ? undefined : await headers();
  const authorization = headersList?.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice(7);
  }

  const cookieStore = request ? undefined : await cookies();
  const cookieCandidates = [
    "privy-access-token",
    "privy_access_token",
    "privy-token",
    "_privy_tk",
    "_privy_refresh_token",
  ];

  for (const key of cookieCandidates) {
    const value = request ? undefined : cookieStore?.get(key)?.value;
    if (value) {
      return value;
    }
  }

  return null;
}

async function verifyToken(token: string): Promise<PrivySession> {
  const cached = tokenCache.get(token);
  if (cached && cached.expiresAt > Date.now()) {
    return { id: cached.memberId };
  }

  const response = await fetch("https://auth.privy.io/api/v1/users/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "privy-app-id": PRIVY_APP_ID!,
    },
  });

  if (!response.ok) {
    tokenCache.delete(token);
    throw new AppError("Invalid Privy token", "UNAUTHENTICATED");
  }

  const payload = await response.json();
  const memberId: string | undefined = payload?.user?.id;
  if (!memberId) {
    throw new AppError("Missing member id in Privy session", "UNAUTHENTICATED");
  }

  tokenCache.set(token, {
    memberId,
    expiresAt: Date.now() + CACHE_MS,
  });

  return { id: memberId };
}

export async function getAuthenticatedMember(request?: Request) {
  const token = await extractToken(request ?? undefined);
  if (!token) {
    throw new AppError("Missing Privy token", "UNAUTHENTICATED");
  }

  const session = await verifyToken(token);
  return { memberId: session.id, token };
}

export async function optionalMember(request?: Request) {
  try {
    return await getAuthenticatedMember(request);
  } catch (error) {
    if (error instanceof AppError && error.code === "UNAUTHENTICATED") {
      return null;
    }
    throw error;
  }
}

export function attachMemberToHeaders(response: Response, memberId: string) {
  const headersCopy = new Headers(response.headers);
  headersCopy.set("x-member-id", memberId);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headersCopy,
  });
}
