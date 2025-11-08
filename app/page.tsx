import Link from "next/link";
import { redirect } from "next/navigation";

import { Card } from "@/components/ui/Card";
import { CommunitySearchList } from "@/components/communities/CommunitySearchList";
import { listMembers, listCommunities } from "@/lib/db/repo";
import { getOnboardingStatus } from "@/lib/onboarding";

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const { user, submission } = await getOnboardingStatus();

  if (user && !submission) {
    redirect("/onboarding");
  }

  const canSeeMembers = Boolean(user && submission);
  const tabParam = Array.isArray(params?.tab) ? params?.tab[0] : params?.tab;
  const requestedTab = tabParam === "members" ? "members" : "communities";
  const tab = canSeeMembers ? requestedTab : "communities";
  const searchParam = Array.isArray(params?.q) ? params?.q[0] : params?.q;
  const communitySearch = tab === "communities" && typeof searchParam === "string" ? searchParam : "";

  const communities = await listCommunities({ search: communitySearch });
  const members = tab === "members" ? await listMembers() : [];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-slate-900">Agartha Members</h1>
        <p className="text-sm text-slate-600">
          Explore the community, discover collaborators, and celebrate great work.
        </p>
      </div>
      {tab === "members" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <Link key={member.id} href={`/members/${encodeURIComponent(member.id)}`}>
              <Card className="space-y-3 p-6 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-100">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.display_name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-500">
                        {member.display_name.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{member.display_name}</h3>
                    <p className="text-xs text-slate-500">Level: {member.level}</p>
                  </div>
                </div>
                <p className="text-xs font-medium text-amber-600">⭐ {member.reputation_score} reputation</p>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <CommunitySearchList
          communities={communities}
          searchQuery={communitySearch}
          formAction="/"
          clearHref="/?tab=communities"
          hiddenFields={[{ name: "tab", value: "communities" }]}
        />
      )}
    </div>
  );
}
