"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { fetchPrivyUser } from "@/lib/auth/privy";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  clearSessionCookie,
  signSession,
} from "@/lib/auth/session";
import { AppError } from "@/lib/errors";
import { ensureProfile } from "@/lib/profile";

const LEGACY_PRIVY_COOKIES = [
  "privy-access-token",
  "privy-token",
  "privy-session",
  "privy-refresh-token",
  "privy-id-token",
  "privy_access_token",
  "privy_refresh_token",
  "_privy_tk",
  "_privy_refresh_token",
];

function clearLegacyCookies(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  for (const cookieName of LEGACY_PRIVY_COOKIES) {
    cookieStore.delete(cookieName);
  }
}

export async function syncAuthToken(token: string) {
  if (!token) {
    await clearSessionCookie();
    return { success: false, error: "Missing Privy access token" } as const;
  }

  try {
    const user = await fetchPrivyUser(token);
    const cookieStore = await cookies();
    clearLegacyCookies(cookieStore);

    const profile = await ensureProfile(user);
    const { token: sessionToken } = await signSession(user, SESSION_MAX_AGE_SECONDS);
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return { success: true, memberId: user.id, isNewMember: profile.isNew } as const;
  } catch (error) {
    console.error("[syncAuthToken] Failed to verify Privy token", error);
    if (error instanceof AppError) {
      if (error.code === "SERVICE_UNAVAILABLE") {
        return {
          success: false,
          error: "Privy is rate limiting right now—please try again in a moment",
        } as const;
      }

      if (error.code === "UNAUTHENTICATED") {
        await clearSessionCookie();
      }
    }

    return { success: false, error: "Failed to verify authentication" } as const;
  }
}

export async function clearAuthSession() {
  await clearSessionCookie();
  const cookieStore = await cookies();
  clearLegacyCookies(cookieStore);
  return { success: true } as const;
}

export async function logout() {
  const cookieStore = await cookies();
  clearLegacyCookies(cookieStore);
  await clearSessionCookie();

  redirect("/");
}
