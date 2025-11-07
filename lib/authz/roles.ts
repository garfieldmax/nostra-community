import { getMember, listProjectParticipants } from "@/lib/db/repo";
import { AuthorizationError } from "@/lib/errors";

export async function isCommunityManager(memberId: string, communityId: string): Promise<boolean> {
  const member = await getMember(memberId);
  if (!member) return false;
  return member.level === "manager";
}

export async function isProjectLead(memberId: string, projectId: string): Promise<boolean> {
  const participants = await listProjectParticipants(projectId);
  return participants.some(
    (participant) =>
      participant.member_id === memberId &&
      participant.role === "lead" &&
      participant.status === "active"
  );
}

export async function assertCanAwardBadge(options: {
  issuerId: string;
  communityId?: string;
  projectId?: string;
}) {
  const { issuerId, communityId, projectId } = options;
  const communityAllowed = communityId ? await isCommunityManager(issuerId, communityId) : false;
  const projectAllowed = projectId ? await isProjectLead(issuerId, projectId) : false;
  if (!communityAllowed && !projectAllowed) {
    throw new AuthorizationError("Only community managers or project leads can award badges", options);
  }
}
