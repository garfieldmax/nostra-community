"use client";

import { useEffect, useRef, useState } from "react";
import type { SVGProps } from "react";
import type {
  Comment,
  Interest,
  Kudos,
  Member,
  MemberBadge,
  MemberContact,
  MemberGoal,
  ProjectParticipation,
} from "@/lib/db/types";
import { ProfileCard } from "@/components/ProfileCard";
import { ContactsList } from "@/components/ContactsList";
import { BadgesList } from "@/components/BadgesList";
import { InterestsChips } from "@/components/InterestsChips";
import { GoalsList } from "@/components/GoalsList";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { GiveKudosModal } from "@/components/GiveKudosModal";
import { ConnectSheet } from "@/components/ConnectSheet";
import { CommentsThread } from "@/components/CommentsThread";
import { KudosFeed } from "@/components/KudosFeed";

function PenIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" />
      <path d="M14.06 6.19l2.12-2.12a1.5 1.5 0 0 1 2.12 0l1.63 1.63a1.5 1.5 0 0 1 0 2.12l-2.12 2.12" />
    </svg>
  );
}

interface MemberProfileShellProps {
  viewerId: string | null;
  member: Member;
  contacts: MemberContact[];
  badges: MemberBadge[];
  interests: Interest[];
  goals: MemberGoal[];
  kudos: Kudos[];
  comments: Comment[];
  participations: ProjectParticipation[];
  mutuals: Member[];
  initialToast?: string | null;
}

export function MemberProfileShell({
  viewerId,
  member,
  contacts,
  badges,
  interests,
  goals,
  kudos,
  comments,
  participations,
  mutuals,
  initialToast = null,
}: MemberProfileShellProps) {
  const [profileMember, setProfileMember] = useState(member);
  const [kudosList, setKudosList] = useState(kudos);
  const [goalsList, setGoalsList] = useState(goals);
  const [displayName, setDisplayName] = useState(member.display_name);
  const [bio, setBio] = useState(member.bio ?? "");
  const [newGoal, setNewGoal] = useState({ title: "", privacy: "public" as "public" | "private" });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [toast, setToast] = useState<string | null>(initialToast);
  const [isKudosOpen, setIsKudosOpen] = useState(false);
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [commentsList, setCommentsList] = useState(comments);
  const editSectionRef = useRef<HTMLDivElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const isSelf = viewerId === member.id;

  useEffect(() => {
    if (initialToast) {
      setToast(initialToast);
      nameInputRef.current?.focus();
      editSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [initialToast]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (member.id !== profileMember.id) {
      // New member, reset everything.
      setProfileMember(member);
      setDisplayName(member.display_name);
      setBio(member.bio ?? "");
    } else if (member !== profileMember) {
      // Same member, props updated. Only update base, not form fields.
      setProfileMember(member);
    }
  }, [member, profileMember]);

  const projectsForKudos = Array.from(
    new Map(
      participations.map((participation) => [
        participation.project_id,
        {
          id: participation.project_id,
          name: participation.project?.name ?? "Project",
        },
      ])
    ).values()
  );

  async function handleGiveKudos(payload: { projectId?: string | null; weight: number; note?: string }) {
    const response = await fetch("/api/kudos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to_member_id: member.id,
        project_id: payload.projectId,
        weight: payload.weight,
        note: payload.note,
      }),
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data?.error?.message ?? "Failed to send kudos");
    }
    setKudosList((prev) => [data.data, ...prev]);
    setToast("Kudos sent!");
  }

  async function handleConnect(payload: { relation: "follow" | "friend" | "collaborator" }) {
    const response = await fetch("/api/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to_member_id: member.id, relation: payload.relation }),
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data?.error?.message ?? "Failed to send connection");
    }
    setToast("Connection request sent");
  }

  const hasProfileChanges =
    displayName.trim() !== profileMember.display_name || bio !== (profileMember.bio ?? "");

  async function handleProfileSave() {
    const trimmedDisplayName = displayName.trim();
    if (!trimmedDisplayName) {
      setToast("Display name is required");
      return;
    }

    setIsSavingProfile(true);
    setToast(null);
    try {
      const response = await fetch(`/api/members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, display_name: trimmedDisplayName }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data?.error?.message ?? "Failed to update profile");
      }
      setProfileMember((prev) => ({ ...prev, display_name: trimmedDisplayName, bio }));
      setToast("Profile updated");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleAddGoal(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch(`/api/members/${member.id}/goals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newGoal.title,
        privacy: newGoal.privacy,
      }),
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      setToast(data?.error?.message ?? "Failed to add goal");
      return;
    }
    setGoalsList((prev) => [data.data, ...prev]);
    setNewGoal({ title: "", privacy: "public" });
    setToast("Goal added");
  }

  async function handleComment(body: string) {
    const response = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject_type: "member", subject_ref: member.id, body }),
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data?.error?.message ?? "Failed to comment");
    }
    setCommentsList((prev) => [data.data, ...prev]);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <div className="space-y-4">
        <ProfileCard
          member={{
            ...profileMember,
            bio: isSelf ? bio : profileMember.bio,
            display_name: isSelf ? displayName : profileMember.display_name,
          }}
          mutuals={mutuals}
          isSelf={isSelf}
          onGiveKudos={viewerId ? () => setIsKudosOpen(true) : undefined}
          onConnect={viewerId && viewerId !== member.id ? () => setIsConnectOpen(true) : undefined}
          onEdit={isSelf ? () => editSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }) : undefined}
        />
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Contacts</h3>
            <ContactsList contacts={contacts.filter((contact) => contact.is_public || isSelf)} />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Badges</h3>
            <BadgesList badges={badges} />
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <section ref={editSectionRef} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Profile details</h2>
              {isSelf && (
                <p className="text-xs text-slate-500">Fields marked with the pen icon are editable.</p>
              )}
            </div>
            {isSelf && (
              <Button size="sm" onClick={handleProfileSave} disabled={isSavingProfile || !hasProfileChanges}>
                {isSavingProfile ? "Saving..." : "Save changes"}
              </Button>
            )}
          </div>
          {isSelf ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="displayName" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <PenIcon className="h-4 w-4 text-slate-400" aria-hidden />
                  Display name
                </label>
                <Input
                  id="displayName"
                  ref={nameInputRef}
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Your preferred name"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="bio" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <PenIcon className="h-4 w-4 text-slate-400" aria-hidden />
                  Bio
                </label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  rows={4}
                  placeholder="Share a quick intro so others know how to collaborate with you"
                />
              </div>
            </div>
          ) : (
            <Card padding="sm" className="space-y-2 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">{displayName}</p>
              <p>{bio || "No bio yet."}</p>
            </Card>
          )}
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">Interests</h2>
          <InterestsChips interests={interests} />
        </section>
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Goals</h2>
            {isSelf && (
              <form className="flex items-center gap-2" onSubmit={handleAddGoal}>
                <Input
                  placeholder="New goal"
                  value={newGoal.title}
                  onChange={(event) => setNewGoal((prev) => ({ ...prev, title: event.target.value }))}
                />
                <select
                  className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
                  value={newGoal.privacy}
                  onChange={(event) =>
                    setNewGoal((prev) => ({ ...prev, privacy: event.target.value as "public" | "private" }))
                  }
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
                <Button type="submit" size="sm" disabled={!newGoal.title.trim()}>
                  Add
                </Button>
              </form>
            )}
          </div>
          <GoalsList goals={goalsList} showPrivate={isSelf} />
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">Active Projects</h2>
          {participations.length === 0 ? (
            <Card padding="sm" className="text-sm text-slate-500">
              Not currently active on projects.
            </Card>
          ) : (
            <Card padding="sm" className="space-y-3">
              {participations.map((participation) => (
                <div key={participation.project_id} className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {participation.project?.name ?? participation.project_id}
                  </p>
                  <p className="text-xs text-slate-500">Role: {participation.role}</p>
                </div>
              ))}
            </Card>
          )}
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">Kudos Received</h2>
          <KudosFeed kudos={kudosList} />
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">Comments</h2>
          <CommentsThread comments={commentsList} onSubmit={viewerId ? handleComment : undefined} />
        </section>
        {toast && (
          <div className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white">{toast}</div>
        )}
      </div>
      <GiveKudosModal
        open={isKudosOpen}
        projects={projectsForKudos}
        onClose={() => setIsKudosOpen(false)}
        onSubmit={handleGiveKudos}
      />
      <ConnectSheet
        open={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
        onSubmit={handleConnect}
      />
    </div>
  );
}
