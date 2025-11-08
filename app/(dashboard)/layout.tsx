import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getUser } from "@/lib/auth";
import { ensureProfile } from "@/lib/profile";
import { getOnboardingSubmission } from "@/lib/db/repo";

// Mark dashboard routes as dynamic since they use cookies for authentication
export const dynamic = 'force-dynamic';

export default async function DashboardGroupLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const headerList = await headers();
  const memberId = headerList.get("x-member-id");

  if (!memberId) {
    redirect("/login");
  }

  const user = await getUser();
  if (!user || user.id !== memberId) {
    console.error("[DashboardGroupLayout] Session missing for authenticated member", { memberId });
    redirect("/login");
  }

  try {
    const record = await ensureProfile(user);
    const submission = await getOnboardingSubmission(record.id);
    if (!submission) {
      redirect("/onboarding");
    }
  } catch (error) {
    console.error("[DashboardGroupLayout] Error ensuring profile:", error);
  }

  return <>{children}</>;
}
