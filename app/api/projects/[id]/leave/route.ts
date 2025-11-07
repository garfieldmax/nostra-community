import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAuthenticatedMember } from "@/lib/auth/privy";
import { leaveProject } from "@/lib/db/repo";
import { toErrorResponse, getStatusFromError } from "@/lib/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { memberId } = await getAuthenticatedMember(request);
    await leaveProject(id, memberId);
    revalidatePath(`/projects/${id}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const response = toErrorResponse(error);
    const status = getStatusFromError(error);
    return NextResponse.json(response, { status });
  }
}
