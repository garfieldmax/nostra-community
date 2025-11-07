import { headers } from "next/headers";
import { listMembers, listMemberInterests, listConnections, getMembers } from "@/lib/db/repo";
import { DiscoveryList, type DiscoveryItem } from "@/components/DiscoveryList";
import type { Member } from "@/lib/db/types";
import { requireOnboardedMember } from "@/lib/onboarding";

export const dynamic = "force-dynamic";

export default async function DiscoverPage() {
  await requireOnboardedMember();
  const headerList = await headers();
  const viewerId = headerList.get("x-member-id");
  const members = await listMembers();

  let viewerInterests = [] as string[];
  const mutualItems: DiscoveryItem[] = [];
  const sharedItems: DiscoveryItem[] = [];
  
  if (viewerId) {
    // Fetch viewer's interests once
    viewerInterests = (await listMemberInterests(viewerId)).map((interest) => interest.id);
    
    // Fetch all viewer's accepted connections once
    const viewerConnections = await listConnections(viewerId);
    const acceptedViewerConnections = viewerConnections.filter((conn) => conn.status === "accepted");
    const viewerConnectionIds = new Set(
      acceptedViewerConnections.map((conn) => 
        conn.from_member_id === viewerId ? conn.to_member_id : conn.from_member_id
      )
    );
    
    // Fetch all member interests in parallel (bulk fetch)
    const otherMemberIds = members.filter(m => m.id !== viewerId).map(m => m.id);
    const allInterestsResults = await Promise.all(
      otherMemberIds.map(async (memberId) => {
        const interests = await listMemberInterests(memberId);
        return { memberId, interestIds: interests.map((i) => i.id) };
      })
    );
    const allMemberInterestsMap = new Map(
      allInterestsResults.map(({ memberId, interestIds }) => [memberId, interestIds])
    );
    
    // Fetch all connections for all other members in parallel (bulk fetch)
    const allMemberConnectionsResults = await Promise.all(
      otherMemberIds.map(async (memberId) => {
        const connections = await listConnections(memberId);
        const acceptedConnections = connections.filter((conn) => conn.status === "accepted");
        const connectionIds = new Set(
          acceptedConnections.map((conn) =>
            conn.from_member_id === memberId ? conn.to_member_id : conn.from_member_id
          )
        );
        return { memberId, connectionIds };
      })
    );
    const memberConnectionsMap = new Map(
      allMemberConnectionsResults.map(({ memberId, connectionIds }) => [memberId, connectionIds])
    );
    
    // Fetch all member objects for viewer's connections (for mutual display)
    const viewerConnectionMembers = await getMembers(Array.from(viewerConnectionIds));
    const viewerConnectionMembersMap = new Map(
      viewerConnectionMembers.map((m) => [m.id, m])
    );
    
    // Now process all members in memory
    for (const member of members) {
      if (member.id !== viewerId) {
        // Check for mutual connections (people both viewer and member are connected to)
        const memberConnectionIds = memberConnectionsMap.get(member.id) ?? new Set<string>();
        const mutualConnectionIds = Array.from(viewerConnectionIds).filter((id) => 
          memberConnectionIds.has(id)
        );
        
        if (mutualConnectionIds.length > 0) {
          const mutuals = mutualConnectionIds
            .map((id) => viewerConnectionMembersMap.get(id))
            .filter(Boolean) as Member[];
          mutualItems.push({ member, mutuals });
        }
        
        // Check for shared interests
        if (viewerInterests.length > 0) {
          const memberInterests = allMemberInterestsMap.get(member.id) ?? [];
          const overlap = memberInterests.filter((id) => viewerInterests.includes(id));
          if (overlap.length > 0) {
            sharedItems.push({ member, mutuals: [] });
          }
        }
      }
    }
  }

  const trendingItems: DiscoveryItem[] = members
    .filter((member) => (viewerId ? member.id !== viewerId : true))
    .slice(0, 6)
    .map((member) => ({ member }));

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-slate-900">Discover Members</h1>
      <p className="text-sm text-slate-600">Find new collaborators by mutual connections and shared interests.</p>
      <div className="mt-6">
        <DiscoveryList mutuals={mutualItems} sharedInterests={sharedItems} trending={trendingItems} />
      </div>
    </div>
  );
}
