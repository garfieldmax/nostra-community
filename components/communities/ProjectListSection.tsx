"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { Project, Residency } from "@/lib/db/types";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface ProjectListSectionProps {
  communityId: string;
  residencies: Residency[];
  projects: Project[];
  canManage: boolean;
}

export function ProjectListSection({ communityId, residencies, projects, canManage }: ProjectListSectionProps) {
  const router = useRouter();
  const [projectList, setProjectList] = useState<Project[]>(projects);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setProjectList(projects);
  }, [projects]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  function handleOpen() {
    setIsFormOpen(true);
    setToast(null);
  }

  function handleClose() {
    setIsFormOpen(false);
  }

  function handleCreated(project: Project) {
    setProjectList((prev) => {
      const filtered = prev.filter((item) => item.id !== project.id);
      return [project, ...filtered];
    });
    setToast("Project created");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Projects</h2>
        {canManage && (
          <Button onClick={handleOpen} size="sm">
            New project
          </Button>
        )}
      </div>
      {projectList.length === 0 ? (
        <Card padding="sm" className="text-sm text-slate-500">
          No projects yet.
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projectList.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="space-y-2">
                <h3 className="text-base font-semibold text-slate-900">{project.name}</h3>
                {project.description && <p className="text-sm text-slate-600">{project.description}</p>}
              </Card>
            </Link>
          ))}
        </div>
      )}
      {toast && <div className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white">{toast}</div>}
      <ProjectForm
        open={isFormOpen}
        onClose={handleClose}
        communityId={communityId}
        residencies={residencies}
        onSuccess={handleCreated}
      />
    </div>
  );
}
