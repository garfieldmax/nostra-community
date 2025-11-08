"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function syncAuthToken(token: string) {
  try {
    const cookieStore = await cookies();
    
    // Set the auth token cookie server-side to ensure it's available immediately
    cookieStore.set("privy-access-token", token, {
      path: "/",
      maxAge: 3600, // 1 hour
      sameSite: "lax",
      httpOnly: false, // Client needs read access for Privy SDK
      secure: process.env.NODE_ENV === "production",
    });
    
    return { success: true };
  } catch (error) {
    console.error("[syncAuthToken] Error setting cookie:", error);
    return { success: false, error: "Failed to sync authentication" };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  
  // Clear Privy cookies
  const privyCookies = [
    "privy-access-token",
    "privy-token",
    "privy-session",
    "privy-refresh-token",
    "privy-id-token"
  ];
  
  for (const cookieName of privyCookies) {
    cookieStore.delete(cookieName);
  }
  
  redirect("/login");
}

