import Link from "next/link";
import { listMembers, listCommunities } from "@/lib/db/repo";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const tabParam = Array.isArray(params?.tab) ? params?.tab[0] : params?.tab;
  const tab = tabParam === "communities" ? "communities" : "members";
  const [members, communities] = await Promise.all([listMembers(), listCommunities()]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-slate-900">Agartha Members</h1>
        <p className="text-sm text-slate-600">
          Explore the community, discover collaborators, and celebrate great work.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/?tab=members"
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            tab === "members"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Members
        </Link>
        <Link
          href="/?tab=communities"
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            tab === "communities"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Communities
        </Link>
      </div>
      {tab === "members" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <Link key={member.id} href={`/members/${member.id}`}>
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
        <div className="grid gap-6 md:grid-cols-2">
          {communities.map((community) => (
            <Link key={community.id} href={`/communities/${community.id}`}>
              <Card className="space-y-2">
                <h2 className="text-lg font-semibold text-slate-900">{community.name}</h2>
                {community.description && <p className="text-sm text-slate-600">{community.description}</p>}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
