import { NextResponse } from "next/server";
import { getAuthenticatedMember } from "@/lib/auth/privy";
import { CommentCreateSchema } from "@/lib/db/validators";
import { createComment } from "@/lib/db/repo";
import { toErrorResponse, ValidationError, getStatusFromError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const { memberId } = await getAuthenticatedMember(request);
    const json = await request.json();
    const parsed = CommentCreateSchema.safeParse(json);
    if (!parsed.success) {
      throw new ValidationError("Invalid comment payload", parsed.error.flatten());
    }
    const comment = await createComment({
      ...parsed.data,
      author_id: memberId,
    });
    return NextResponse.json({ ok: true, data: comment });
  } catch (error) {
    const response = toErrorResponse(error);
    const status = getStatusFromError(error);
    return NextResponse.json(response, { status });
  }
}
