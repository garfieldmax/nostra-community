import Link from "next/link";
import type { Member } from "@/lib/db/types";
import { Card } from "@/components/ui/Card";

export interface DiscoveryItem {
  member: Member;
  mutuals?: Member[];
}

interface DiscoveryListProps {
  mutuals: DiscoveryItem[];
  sharedInterests: DiscoveryItem[];
  trending: DiscoveryItem[];
}

function DiscoverySection({ title, members }: { title: string; members: DiscoveryItem[] }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      {members.length === 0 ? (
        <Card padding="sm" className="text-sm text-slate-500">
          Nothing to show yet.
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {members.map(({ member, mutuals }) => (
            <Link key={member.id} href={`/members/${encodeURIComponent(member.id)}`}>
              <Card padding="sm" className="flex items-center gap-3 transition-shadow hover:shadow-md">
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
                <p className="text-sm font-semibold text-slate-900">{member.display_name}</p>
                <p className="text-xs text-slate-500">Level: {member.level}</p>
                {mutuals && mutuals.length > 0 && (
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {mutuals.slice(0, 3).map((mutual) => (
                        <div
                          key={mutual.id}
                          className="h-6 w-6 overflow-hidden rounded-full border-2 border-white bg-slate-100"
                        >
                          {mutual.avatar_url ? (
                            <img
                              src={mutual.avatar_url}
                              alt={mutual.display_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-slate-500">
                              {mutual.display_name.slice(0, 1).toUpperCase()}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-slate-500">{mutuals.length} mutual</span>
                  </div>
                )}
              </div>
            </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export function DiscoveryList({ mutuals, sharedInterests, trending }: DiscoveryListProps) {
  return (
    <div className="space-y-6">
      <DiscoverySection title="Mutual Connections" members={mutuals} />
      <DiscoverySection title="Shared Interests" members={sharedInterests} />
      <DiscoverySection title="Trending" members={trending} />
    </div>
  );
}
