import { headers } from "next/headers";
import { getMember } from "@/lib/db/repo";
import type { Member } from "@/lib/db/types";

/**
 * Checks if the current request is from a community manager.
 * Returns the member if they are a manager, otherwise null.
 */
export async function assertAdmin(): Promise<Member | null> {
  const headerList = await headers();
  const viewerId = headerList.get("x-member-id");
  if (!viewerId) return null;
  const member = await getMember(viewerId);
  if (!member || member.level !== "manager") {
    return null;
  }
  return member;
}

