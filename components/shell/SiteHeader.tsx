import Link from "next/link";
import { Suspense } from "react";

import { SiteNav } from "@/components/shell/SiteNav";
import { UserMenu } from "@/components/shell/UserMenu";
import { getOnboardingStatus } from "@/lib/onboarding";

function deriveDisplayName({
  submissionName,
  memberName,
  email,
}: {
  submissionName?: string | null;
  memberName?: string | null;
  email?: string | null;
}) {
  if (submissionName && submissionName.length > 0) {
    return submissionName;
  }
  if (memberName && memberName.length > 0) {
    return memberName;
  }
  if (email && email.includes("@")) {
    return email.split("@")[0] ?? email;
  }
  return email ?? null;
}

export async function SiteHeader() {
  const { user, member, submission } = await getOnboardingStatus();
  const email = submission?.email ?? user?.email ?? null;
  const displayName = deriveDisplayName({
    submissionName: submission?.name,
    memberName: member?.display_name ?? null,
    email,
  });
  const canSeeMembers = Boolean(user);

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] border-b bg-white shadow-sm md:static md:shadow-none">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4">
        <div className="flex flex-1 items-center">
          <Link href="/" className="text-sm font-semibold text-slate-800 hover:text-slate-900">
            Home
          </Link>
        </div>
        <div className="flex justify-center">
          <Suspense fallback={<div className="h-8 w-32" />}>
            <SiteNav canSeeMembers={canSeeMembers} />
          </Suspense>
        </div>
        <div className="flex flex-1 items-center justify-end gap-4">
          <Link
            href="/about"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            About
          </Link>
          {user ? (
            <UserMenu user={{ displayName, email }} memberId={member?.id ?? null} />
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
