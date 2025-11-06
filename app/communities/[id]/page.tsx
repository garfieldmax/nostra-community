import Link from "next/link";
import { notFound } from "next/navigation";
import { getCommunityWithChildren, listResidencies, listProjects } from "@/lib/db/repo";
import { Card } from "@/components/ui/Card";

interface CommunityPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function CommunityPage({ params }: CommunityPageProps) {
  const { id } = await params;
  const community = await getCommunityWithChildren(id).catch(() => null);
  if (!community) {
    notFound();
  }
  const [residencies, projects] = await Promise.all([
    listResidencies(community.id),
    listProjects({ communityId: community.id }),
  ]);
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">{community.name}</h1>
        {community.description && <p className="text-sm text-slate-600">{community.description}</p>}
      </header>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Residencies</h2>
        {residencies.length === 0 ? (
          <Card padding="sm" className="text-sm text-slate-500">
            No residencies yet.
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {residencies.map((residency) => (
              <Card key={residency.id} className="space-y-2">
                <h3 className="text-base font-semibold text-slate-900">{residency.name}</h3>
                {residency.description && <p className="text-sm text-slate-600">{residency.description}</p>}
              </Card>
            ))}
          </div>
        )}
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Projects</h2>
        {projects.length === 0 ? (
          <Card padding="sm" className="text-sm text-slate-500">
            No projects yet.
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="space-y-2">
                  <h3 className="text-base font-semibold text-slate-900">{project.name}</h3>
                  {project.description && <p className="text-sm text-slate-600">{project.description}</p>}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
