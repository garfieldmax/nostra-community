import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  getMember,
  listMemberContacts,
  listMemberBadges,
  listMemberInterests,
  listMemberGoals,
  listKudosForMember,
  listActiveParticipationsForMember,
  listComments,
} from "@/lib/db/repo";
import { MemberProfileShell } from "@/components/MemberProfileShell";
import { getMutuals } from "@/lib/social/mutuals";
import { requireOnboardedMember } from "@/lib/onboarding";

interface MemberPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function MemberPage({ params }: MemberPageProps) {
  await requireOnboardedMember();
  const { id } = await params;
  const member = await getMember(id);
  if (!member) {
    notFound();
  }

  const [contacts, badges, interests, goals, kudos, participations, comments] = await Promise.all([
    listMemberContacts(member.id),
    listMemberBadges(member.id),
    listMemberInterests(member.id),
    listMemberGoals(member.id),
    listKudosForMember(member.id),
    listActiveParticipationsForMember(member.id),
    listComments("member", member.id),
  ]);

  const headerList = await headers();
  const viewerId = headerList.get("x-member-id");
  const mutuals = viewerId ? await getMutuals(viewerId, member.id) : [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <MemberProfileShell
        viewerId={viewerId}
        member={member}
        contacts={contacts}
        badges={badges}
        interests={interests}
        goals={goals}
        kudos={kudos}
        comments={comments}
        participations={participations}
        mutuals={mutuals}
      />
    </div>
  );
}
