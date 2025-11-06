import type { Kudos, Project } from "@/lib/db/types";
import { Card } from "@/components/ui/Card";

interface KudosFeedItem extends Omit<Kudos, 'project' | 'from_member'> {
  project?: Project | null;
  from_member?: { id: string; display_name: string; avatar_url: string | null } | null;
}

interface KudosFeedProps {
  kudos: KudosFeedItem[];
}

export function KudosFeed({ kudos }: KudosFeedProps) {
  if (kudos.length === 0) {
    return (
      <Card padding="sm" className="text-sm text-slate-500">
        No kudos yet.
      </Card>
    );
  }

  return (
    <Card padding="sm" className="space-y-4">
      {kudos.map((item) => (
        <div key={item.id} className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-100">
              {item.from_member?.avatar_url ? (
                <img
                  src={item.from_member.avatar_url}
                  alt={item.from_member.display_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-500">
                  {item.from_member?.display_name?.slice(0, 1).toUpperCase() ?? "?"}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {item.from_member?.display_name ?? item.from_member_id}
              </p>
              <p className="text-xs text-slate-500">
                {new Date(item.created_at).toLocaleString()} • Weight {item.weight}
              </p>
            </div>
          </div>
          {item.note && <p className="text-sm text-slate-600">{item.note}</p>}
          {item.project && <p className="text-xs text-slate-500">Project: {item.project.name}</p>}
        </div>
      ))}
    </Card>
  );
}
