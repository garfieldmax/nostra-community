import { getMembers, listMutualConnections } from "@/lib/db/repo";
import type { Member } from "@/lib/db/types";

export async function getMutuals(viewerId: string, targetId: string): Promise<Member[]> {
  if (viewerId === targetId) {
    return [];
  }
  const connections = await listMutualConnections(viewerId, targetId);
  const ids = Array.from(new Set(connections.map((connection) => connection.to_member_id)));
  const members = await getMembers(ids);
  return members;
}
