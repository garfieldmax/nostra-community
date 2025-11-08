import { AppError } from "@/lib/errors";
import { SessionUser, readSessionFromCookies, readSessionFromRequest } from "@/lib/auth/session";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

if (!PRIVY_APP_ID) {
  throw new Error("NEXT_PUBLIC_PRIVY_APP_ID is not configured");
}

type PrivyApiUser = {
  id: string;
  created_at?: number;
  linked_accounts?: Array<{
    type: string;
    address?: string;
    email?: string;
  }>;
};

type PrivyApiResponse = {
  user?: PrivyApiUser;
};

const TOKEN_CACHE_TTL_MS = 5 * 60 * 1000;
const RATE_LIMIT_CACHE_TTL_MS = 15 * 60 * 1000;

const tokenCache = new Map<string, { user: SessionUser; expiresAt: number }>();
const rateLimitCache = new Map<string, { user: SessionUser; expiresAt: number }>();

function normalizeLinkedAccounts(accounts: PrivyApiUser["linked_accounts"]) {
  if (!Array.isArray(accounts)) {
    return [] as SessionUser["linkedAccounts"];
  }

  return accounts.map((account) => ({
    type: account.type,
    address: account.address,
    email: account.email,
  }));
}

export async function fetchPrivyUser(token: string): Promise<SessionUser> {
  const now = Date.now();
  const cached = tokenCache.get(token);
  if (cached && cached.expiresAt > now) {
    return cached.user;
  }

  const rateLimited = rateLimitCache.get(token);
  if (rateLimited && rateLimited.expiresAt > now) {
    return rateLimited.user;
  }

  let response: Response;
  try {
    response = await fetch("https://auth.privy.io/api/v1/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "privy-app-id": PRIVY_APP_ID!,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[fetchPrivyUser] Network error verifying Privy token", error);
    if (cached) {
      return cached.user;
    }
    throw new AppError("Failed to verify Privy token", "UNAUTHENTICATED");
  }

  if (response.status === 429) {
    console.warn("[fetchPrivyUser] Privy rate limited token verification");
    if (cached) {
      rateLimitCache.set(token, { user: cached.user, expiresAt: now + RATE_LIMIT_CACHE_TTL_MS });
      return cached.user;
    }
    if (rateLimited) {
      return rateLimited.user;
    }
    throw new AppError("Failed to verify Privy token", "UNAUTHENTICATED");
  }

  if (!response.ok) {
    tokenCache.delete(token);
    rateLimitCache.delete(token);
    if (response.status === 401 || response.status === 403) {
      throw new AppError("Invalid Privy token", "UNAUTHENTICATED");
    }

    console.warn(
      "[fetchPrivyUser] Unexpected Privy verification failure",
      response.status,
      response.statusText,
    );
    throw new AppError("Failed to verify Privy token", "UNAUTHENTICATED");
  }

  const payload = (await response.json()) as PrivyApiResponse;
  const user = payload.user;
  if (!user?.id) {
    throw new AppError("Missing member id in Privy session", "UNAUTHENTICATED");
  }

  const linkedAccounts = normalizeLinkedAccounts(user.linked_accounts);
  const emailAccount = linkedAccounts.find((account) => account.type === "email");

  const createdAtValue = user.created_at;
  const createdAt =
    typeof createdAtValue === "number"
      ? createdAtValue >= 1e12
        ? createdAtValue
        : createdAtValue * 1000
      : Date.now();

  const sessionUser: SessionUser = {
    id: user.id,
    createdAt,
    linkedAccounts,
    email: emailAccount?.email,
  };

  tokenCache.set(token, { user: sessionUser, expiresAt: now + TOKEN_CACHE_TTL_MS });
  rateLimitCache.set(token, { user: sessionUser, expiresAt: now + RATE_LIMIT_CACHE_TTL_MS });

  return sessionUser;
}

export async function getSessionUser() {
  return readSessionFromCookies();
}

export async function getSessionFromRequest(request?: Request) {
  if (!request) {
    return readSessionFromCookies();
  }
  return readSessionFromRequest(request);
}

export async function getAuthenticatedMember(request?: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    throw new AppError("Missing authenticated session", "UNAUTHENTICATED");
  }

  return { memberId: session.id, session };
}

export async function optionalMember(request?: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return null;
  }
  return { memberId: session.id, session };
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
