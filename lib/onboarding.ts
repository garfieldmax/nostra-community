import { redirect } from "next/navigation";

import { getMember, getOnboardingSubmission } from "@/lib/db/repo";
import { getUser } from "@/lib/auth";
import { ensureProfile } from "@/lib/profile";

export async function requireOnboardedMember() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const memberRecord = await ensureProfile(user);
  const member = await getMember(memberRecord.id);
  const submission = await getOnboardingSubmission(memberRecord.id);
  if (!submission) {
    redirect("/onboarding");
  }

  return { user, member: member ?? null, submission };
}

export async function getOnboardingStatus() {
  const user = await getUser();
  if (!user) {
    return { user: null, member: null, submission: null } as const;
  }

  const memberRecord = await ensureProfile(user);
  const member = await getMember(memberRecord.id);
  const submission = await getOnboardingSubmission(memberRecord.id);

  return { user, member: member ?? null, submission } as const;
}
