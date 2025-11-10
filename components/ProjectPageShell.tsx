"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Comment, Project, ProjectParticipation, Residency } from "@/lib/db/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProjectRoster } from "@/components/ProjectRoster";
import { CommentsThread } from "@/components/CommentsThread";
import { GiveKudosModal } from "@/components/GiveKudosModal";
import { ProjectForm } from "@/components/projects/ProjectForm";

interface ProjectPageShellProps {
  viewerId: string | null;
  project: Project;
  participants: Array<ProjectParticipation>;
  comments: Comment[];
  residencies: Residency[];
  canEditProject: boolean;
  canApproveParticipants: boolean;
}

export function ProjectPageShell({
  viewerId,
  project,
  participants,
  comments,
  residencies,
  canEditProject,
  canApproveParticipants,
}: ProjectPageShellProps) {
  const router = useRouter();
  const [projectDetails, setProjectDetails] = useState(project);
  const [roster, setRoster] = useState(participants);
  const [commentList, setCommentList] = useState(comments);
  const [isKudosOpen, setIsKudosOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [approvingMemberId, setApprovingMemberId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setProjectDetails(project);
  }, [project]);

  useEffect(() => {
    setRoster(participants);
  }, [participants]);

  useEffect(() => {
    setCommentList(comments);
  }, [comments]);

  const viewerParticipation = useMemo(
    () => roster.find((participant) => participant.member_id === viewerId),
    [roster, viewerId]
  );
  const isMember = viewerParticipation?.status === "active";
  const isPendingApproval = viewerParticipation?.status === "invited";

  async function handleJoin() {
    if (!viewerId) return;
    const response = await fetch(`/api/projects/${projectDetails.id}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "contributor" }),
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      setToast(data?.error?.message ?? "Failed to join project");
      return;
    }
    setRoster((prev) => {
      const filtered = prev.filter(
        (item) => !(item.member_id === viewerId && item.project_id === projectDetails.id)
      );
      return [data.data, ...filtered];
    });
    setToast(data.data.status === "active" ? "Joined project" : "Join request sent for approval");
  }

  async function handleLeave() {
    if (!viewerId) return;
    const response = await fetch(`/api/projects/${projectDetails.id}/leave`, { method: "POST" });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      setToast(data?.error?.message ?? "Failed to leave project");
      return;
    }
    setRoster((prev) =>
      prev.filter((item) => !(item.member_id === viewerId && item.project_id === projectDetails.id))
    );
    setToast("Left project");
  }

  async function handleGiveKudos(payload: { weight: number; note?: string; projectId?: string | null }) {
    const response = await fetch("/api/kudos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to_member_id: projectDetails.created_by,
        project_id: projectDetails.id,
        weight: payload.weight,
        note: payload.note,
      }),
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data?.error?.message ?? "Failed to send kudos");
    }
    setToast("Kudos sent");
  }

  async function handleApprove(memberId: string) {
    setApprovingMemberId(memberId);
    try {
      const response = await fetch(`/api/projects/${projectDetails.id}/participants/${memberId}/approve`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data?.error?.message ?? "Failed to approve member");
      }
      setRoster((prev) =>
        prev.map((participant) => (participant.member_id === memberId ? data.data : participant))
      );
      setToast("Member approved");
      router.refresh();
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Failed to approve member");
    } finally {
      setApprovingMemberId(null);
    }
  }

  function handleProjectSaved(updated: Project) {
    setProjectDetails(updated);
    setIsEditing(false);
    setToast("Project updated");
    router.refresh();
  }

  async function handleComment(body: string) {
    const response = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject_type: "project", subject_ref: projectDetails.id, body }),
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data?.error?.message ?? "Failed to comment");
    }
    setCommentList((prev) => [data.data, ...prev]);
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{projectDetails.name}</h1>
            {projectDetails.description && <p className="text-sm text-slate-600">{projectDetails.description}</p>}
          </div>
          {viewerId && (
            <div className="flex gap-2">
              {isMember ? (
                <Button variant="secondary" onClick={handleLeave}>
                  Leave project
                </Button>
              ) : isPendingApproval ? (
                <Button variant="secondary" disabled>
                  Awaiting approval
                </Button>
              ) : (
                <Button onClick={handleJoin}>Join project</Button>
              )}
              <Button variant="ghost" onClick={() => setIsKudosOpen(true)}>
                Give Kudos
              </Button>
              {canEditProject && (
                <Button variant="ghost" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              )}
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500">Created by {projectDetails.created_by}</p>
        {isPendingApproval && (
          <p className="text-xs text-amber-600">Your request is pending manager approval.</p>
        )}
      </Card>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">Participants</h2>
        <ProjectRoster
          participants={roster}
          canApprove={canApproveParticipants}
          onApprove={handleApprove}
          approvingMemberId={approvingMemberId}
        />
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">Comments</h2>
        <CommentsThread comments={commentList} onSubmit={viewerId ? handleComment : undefined} />
      </section>
      {toast && <div className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white">{toast}</div>}
      <GiveKudosModal
        open={isKudosOpen}
        onClose={() => setIsKudosOpen(false)}
        projects={[{ id: projectDetails.id, name: projectDetails.name }]}
        onSubmit={handleGiveKudos}
      />
      <ProjectForm
        open={isEditing}
        onClose={() => setIsEditing(false)}
        communityId={projectDetails.community_id}
        residencies={residencies}
        project={projectDetails}
        onSuccess={handleProjectSaved}
      />
    </div>
  );
}
