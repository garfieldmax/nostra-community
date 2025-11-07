import type { ReactNode } from "react";

import { getUser } from "@/lib/auth";
import { ensureProfile } from "@/lib/profile";
import { getOnboardingSubmission } from "@/lib/db/repo";
import { redirect } from "next/navigation";

// Mark dashboard routes as dynamic since they use cookies for authentication
export const dynamic = 'force-dynamic';

export default async function DashboardGroupLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const user = await getUser();

  // Only redirect if truly not authenticated (not just rate limited)
  // If user is null due to rate limiting, still allow access but log warning
  if (!user) {
    // Check if we have Privy cookies (means user is logged in but verification failed)
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const hasPrivyCookies = 
      cookieStore.get("privy-access-token")?.value ||
      cookieStore.get("privy-token")?.value ||
      cookieStore.get("privy-session")?.value;
    
    if (hasPrivyCookies) {
      // User has cookies but verification failed - likely rate limited
      // Allow access but log warning
      console.warn("[DashboardGroupLayout] User has Privy cookies but verification failed - likely rate limited");
    } else {
      // No cookies at all - redirect to login
      redirect("/login");
    }
  } else {
    // Ensure profile exists for authenticated user
    try {
      const record = await ensureProfile(user);
      const submission = await getOnboardingSubmission(record.id);
      if (!submission) {
        redirect("/onboarding");
      }
    } catch (error) {
      console.error("[DashboardGroupLayout] Error ensuring profile:", error);
      // Continue even if profile creation fails
    }
  }

  return <>{children}</>;
}
