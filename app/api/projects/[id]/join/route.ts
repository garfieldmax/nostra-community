import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAuthenticatedMember } from "@/lib/auth/privy";
import { ProjectJoinSchema } from "@/lib/db/validators";
import { upsertProjectParticipation } from "@/lib/db/repo";
import { toErrorResponse, ValidationError, getStatusFromError } from "@/lib/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { memberId } = await getAuthenticatedMember(request);
    const json = await request.json();
    const parsed = ProjectJoinSchema.safeParse({ ...json, project_id: id });
    if (!parsed.success) {
      throw new ValidationError("Invalid join payload", parsed.error.flatten());
    }
    const participation = await upsertProjectParticipation({
      project_id: parsed.data.project_id,
      member_id: memberId,
      role: parsed.data.role,
      status: parsed.data.status,
    });
    revalidatePath(`/projects/${id}`);
    return NextResponse.json({ ok: true, data: participation });
  } catch (error) {
    const response = toErrorResponse(error);
    const status = getStatusFromError(error);
    return NextResponse.json(response, { status });
  }
}
