import { supabaseServer } from "@/lib/supabaseServer";
import {
  Badge,
  Community,
  Interest,
  Member,
  MemberBadge,
  MemberContact,
  MemberGoal,
  MemberInterest,
  MemberConnection,
  ParticipationStatus,
  Project,
  Residency,
  ProjectParticipation,
  ProjectRole,
  Kudos,
  ConnectionStatus,
  ConnectionRelation,
  Comment,
} from "@/lib/db/types";
import { AppError } from "@/lib/errors";

function handleError(error: unknown): never {
  if (error && typeof error === "object" && "code" in error && "message" in error) {
    throw new AppError((error as { message: string }).message, "INTERNAL", error as Record<string, unknown>);
  }
  throw new AppError("Unexpected database error", "INTERNAL", {
    error,
  });
}

export async function getMember(id: string): Promise<Member | null> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.from("members").select("*").eq("id", id).maybeSingle();
  if (error) handleError(error);
  return data;
}

export async function listMembers(): Promise<Member[]> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("reputation_score", { ascending: false })
    .limit(100);
  if (error) handleError(error);
  return data ?? [];
}

export async function upsertMember(member: Partial<Member> & { id: string }): Promise<Member> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.from("members").upsert(member).select("*").single();
  if (error) handleError(error);
  return data;
}

export async function updateMember(id: string, patch: Partial<Member>): Promise<Member> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.from("members").update(patch).eq("id", id).select("*").single();
  if (error) handleError(error);
  return data;
}

export async function listMemberContacts(memberId: string): Promise<MemberContact[]> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("member_contacts")
    .select("*")
    .eq("member_id", memberId)
    .order("created_at", { ascending: true });
  if (error) handleError(error);
  return data ?? [];
}

export async function createMemberContact(contact: Omit<MemberContact, "id" | "created_at">): Promise<MemberContact> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("member_contacts")
    .insert(contact)
    .select("*")
    .single();
  if (error) handleError(error);
  return data;
}

export async function listInterests(): Promise<Interest[]> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.from("interests").select("*").order("label", { ascending: true });
  if (error) handleError(error);
  return data ?? [];
}

export async function setMemberInterests(memberId: string, interestIds: string[]): Promise<MemberInterest[]> {
  const supabase = await supabaseServer();
  await supabase.from("member_interests").delete().eq("member_id", memberId);
  if (interestIds.length === 0) return [];
  const rows = interestIds.map((interest_id) => ({ member_id: memberId, interest_id }));
  const { data, error } = await supabase.from("member_interests").insert(rows).select("*");
  if (error) handleError(error);
  return data ?? [];
}

export async function listMemberInterests(memberId: string): Promise<Interest[]> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("member_interests")
    .select("interests(*)")
    .eq("member_id", memberId);
  if (error) handleError(error);
  return (data ?? []).map((row) => row.interests as unknown as Interest);
}

export async function listMemberGoals(memberId: string): Promise<MemberGoal[]> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("member_goals")
    .select("*")
    .eq("member_id", memberId)
    .order("created_at", { ascending: true });
  if (error) handleError(error);
  return data ?? [];
}

export async function createMemberGoal(goal: Omit<MemberGoal, "id" | "created_at" | "updated_at">): Promise<MemberGoal> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.from("member_goals").insert(goal).select("*").single();
  if (error) handleError(error);
  return data;
}

export async function updateMemberGoal(id: string, patch: Partial<MemberGoal>): Promise<MemberGoal> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.from("member_goals").update(patch).eq("id", id).select("*").single();
  if (error) handleError(error);
  return data;
}

export async function deleteMemberGoal(id: string): Promise<void> {
  const supabase = await supabaseServer();
  const { error } = await supabase.from("member_goals").delete().eq("id", id);
  if (error) handleError(error);
}

export async function listCommunities(): Promise<Community[]> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.from("communities").select("*").order("name", { ascending: true });
  if (error) handleError(error);
  return data ?? [];
}

export async function getCommunityWithChildren(id: string) {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("communities")
    .select("*, residencies(*), projects(*)")
    .eq("id", id)
    .single();
  if (error) handleError(error);
  return data as Community & { residencies: Residency[]; projects: Project[] };
}

export async function listResidencies(communityId: string): Promise<Residency[]> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("residencies")
    .select("*")
    .eq("community_id", communityId)
    .order("created_at", { ascending: true });
  if (error) handleError(error);
  return data ?? [];
}

export async function listProjects(filter?: { communityId?: string; residencyId?: string }): Promise<Project[]> {
  const supabase = await supabaseServer();
  let query = supabase.from("projects").select("*");
  if (filter?.communityId) {
    query = query.eq("community_id", filter.communityId);
  }
  if (filter?.residencyId) {
    query = query.eq("residency_id", filter.residencyId);
  }
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) handleError(error);
  return data ?? [];
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (error) handleError(error);
  return data;
}

export async function listProjectParticipants(projectId: string): Promise<ProjectParticipation[]> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("project_participation")
    .select("*")
    .eq("project_id", projectId)
    .order("joined_at", { ascending: true });
  if (error) handleError(error);
  return data ?? [];
}

export async function upsertProjectParticipation(participation: {
  project_id: string;
  member_id: string;
  role: ProjectRole;
  status: ParticipationStatus;
}): Promise<ProjectParticipation> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("project_participation")
    .upsert({
      ...participation,
      joined_at: new Date().toISOString(),
    })
    .select("*, members(*)")
    .single();
  if (error) handleError(error);
  return { ...data, member: (data as ProjectParticipation & { members: Member }).members };
}

export async function leaveProject(projectId: string, memberId: string): Promise<void> {
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("project_participation")
    .update({ status: "dropped", left_at: new Date().toISOString() })
    .eq("project_id", projectId)
    .eq("member_id", memberId);
  if (error) handleError(error);
}

export async function createKudos(input: {
  from_member_id: string;
  to_member_id: string;
  project_id?: string | null;
  weight: number;
  note?: string | null;
}): Promise<Kudos> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("kudos")
    .insert({
      ...input,
      project_id: input.project_id ?? null,
    })
    .select("*")
    .single();
  if (error) handleError(error);
  return data;
}

export async function countDailyKudosSent(memberId: string, dayStart: string, dayEnd: string): Promise<number> {
  const supabase = await supabaseServer();
  const { count, error } = await supabase
    .from("kudos")
    .select("id", { head: true, count: "exact" })
    .eq("from_member_id", memberId)
    .gte("created_at", dayStart)
    .lt("created_at", dayEnd);
  if (error) handleError(error);
  return count ?? 0;
}

export async function countActiveParticipations(memberId: string, day: Date): Promise<number> {
  const supabase = await supabaseServer();
  const isoDay = day.toISOString();
  const { count, error } = await supabase
    .from("project_participation")
    .select("project_id", { head: true, count: "exact" })
    .eq("member_id", memberId)
    .eq("status", "active")
    .lte("joined_at", isoDay)
    .or(`left_at.is.null,left_at.gt.${isoDay}`);
  if (error) handleError(error);
  return count ?? 0;
}

export async function listKudosForMember(memberId: string): Promise<Kudos[]> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("kudos")
    .select("*")
    .eq("to_member_id", memberId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) handleError(error);
  return data ?? [];
}

export async function listActiveParticipationsForMember(memberId: string): Promise<ProjectParticipation[]> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("project_participation")
    .select("*")
    .eq("member_id", memberId)
    .eq("status", "active");
  if (error) handleError(error);
  return data ?? [];
}

export async function listMemberBadges(memberId: string): Promise<MemberBadge[]> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("member_badges")
    .select("*, badges(*)")
    .eq("member_id", memberId)
    .order("awarded_at", { ascending: false });
  if (error) handleError(error);
  return (data ?? []).map((row: MemberBadge & { badges: Badge }) => ({
    ...row,
    badge: row.badges,
  }));
}

export async function listBadges(): Promise<Badge[]> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.from("badges").select("*").order("name", { ascending: true });
  if (error) handleError(error);
  return data ?? [];
}

export async function awardBadge(input: {
  member_id: string;
  badge_id: string;
  awarded_by: string;
  note?: string | null;
}): Promise<MemberBadge> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("member_badges")
    .upsert({
      member_id: input.member_id,
      badge_id: input.badge_id,
      awarded_by: input.awarded_by,
      note: input.note ?? null,
      awarded_at: new Date().toISOString(),
    })
    .select("*, badges(*)")
    .single();
  if (error) handleError(error);
  return { ...data, badge: (data as MemberBadge & { badges: Badge }).badges };
}

export async function upsertBadge(badge: Partial<Badge> & { id?: string }): Promise<Badge> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.from("badges").upsert(badge).select("*").single();
  if (error) handleError(error);
  return data;
}

export async function deleteBadge(id: string): Promise<void> {
  const supabase = await supabaseServer();
  const { error } = await supabase.from("badges").delete().eq("id", id);
  if (error) handleError(error);
}

export async function upsertInterest(interest: Partial<Interest> & { id?: string }): Promise<Interest> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.from("interests").upsert(interest).select("*").single();
  if (error) handleError(error);
  return data;
}

export async function deleteInterest(id: string): Promise<void> {
  const supabase = await supabaseServer();
  const { error } = await supabase.from("interests").delete().eq("id", id);
  if (error) handleError(error);
}

export async function createConnection(input: {
  from_member_id: string;
  to_member_id: string;
  relation: ConnectionRelation;
}): Promise<MemberConnection> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("member_connections")
    .upsert({
      ...input,
      status: "pending",
      created_at: new Date().toISOString(),
    })
    .select("*")
    .single();
  if (error) handleError(error);
  return data;
}

export async function updateConnectionStatus(
  fromMemberId: string,
  toMemberId: string,
  relation: ConnectionRelation,
  status: ConnectionStatus
): Promise<MemberConnection> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("member_connections")
    .update({ status, responded_at: new Date().toISOString() })
    .eq("from_member_id", fromMemberId)
    .eq("to_member_id", toMemberId)
    .eq("relation", relation)
    .select("*")
    .single();
  if (error) handleError(error);
  return data;
}

export async function listConnections(memberId: string): Promise<MemberConnection[]> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("member_connections")
    .select("*")
    .or(`from_member_id.eq.${memberId},to_member_id.eq.${memberId}`)
    .order("created_at", { ascending: false });
  if (error) handleError(error);
  return data ?? [];
}

export async function listMutualConnections(a: string, b: string): Promise<MemberConnection[]> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("member_connections")
    .select("*")
    .eq("from_member_id", a)
    .eq("status", "accepted");
  if (error) handleError(error);
  const fromA = data ?? [];
  const { data: fromB, error: errorB } = await supabase
    .from("member_connections")
    .select("*")
    .eq("from_member_id", b)
    .eq("status", "accepted");
  if (errorB) handleError(errorB);
  const setA = new Set(fromA.map((conn) => `${conn.to_member_id}:${conn.relation}`));
  return (fromB ?? []).filter((conn) => setA.has(`${conn.to_member_id}:${conn.relation}`));
}

export async function createComment(comment: Omit<Comment, "id" | "created_at">): Promise<Comment> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("comments")
    .insert(comment)
    .select("*")
    .single();
  if (error) handleError(error);
  return data;
}

export async function listComments(subjectType: Comment["subject_type"], subjectRef: string): Promise<Comment[]> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("subject_type", subjectType)
    .eq("subject_ref", subjectRef)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) handleError(error);
  return data ?? [];
}
