import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getProject, listProjectParticipants, listComments } from "@/lib/db/repo";
import { ProjectPageShell } from "@/components/ProjectPageShell";
import { requireOnboardedMember } from "@/lib/onboarding";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: ProjectPageProps) {
  await requireOnboardedMember();
  const { id } = await params;
  const project = await getProject(id);
  if (!project) {
    notFound();
  }
  const [participants, comments] = await Promise.all([
    listProjectParticipants(project.id),
    listComments("project", project.id),
  ]);
  const headerList = await headers();
  const viewerId = headerList.get("x-member-id");
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <ProjectPageShell viewerId={viewerId} project={project} participants={participants} comments={comments} />
    </div>
  );
}
