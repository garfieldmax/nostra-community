import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedMember } from "@/lib/auth/privy";
import { GoalCreateSchema } from "@/lib/db/validators";
import { createMemberGoal } from "@/lib/db/repo";
import { AuthorizationError, toErrorResponse, ValidationError } from "@/lib/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { memberId } = await getAuthenticatedMember(request);
    if (memberId !== id) {
      throw new AuthorizationError("You can only create goals for yourself");
    }
    const json = await request.json();
    const parsed = GoalCreateSchema.safeParse({ ...json, member_id: memberId });
    if (!parsed.success) {
      throw new ValidationError("Invalid goal payload", parsed.error.flatten());
    }
    const goal = await createMemberGoal({
      ...parsed.data,
      details: parsed.data.details ?? null,
      target_date: parsed.data.target_date ?? null,
    });
    revalidatePath(`/members/${memberId}`);
    return NextResponse.json({ ok: true, data: goal });
  } catch (error) {
    const response = toErrorResponse(error);
    const status =
      response.error.code === "VALIDATION_FAILED"
        ? 400
        : response.error.code === "FORBIDDEN"
        ? 403
        : response.error.code === "UNAUTHENTICATED"
        ? 401
        : 500;
    return NextResponse.json(response, { status });
  }
}
