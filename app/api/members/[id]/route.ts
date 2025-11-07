import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedMember } from "@/lib/auth/privy";
import { MemberUpdateSchema } from "@/lib/db/validators";
import { updateMember } from "@/lib/db/repo";
import { AuthorizationError, toErrorResponse, ValidationError, getStatusFromError } from "@/lib/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { memberId } = await getAuthenticatedMember(request);
    if (memberId !== id) {
      throw new AuthorizationError("You can only update your own profile");
    }
    const json = await request.json();
    const parsed = MemberUpdateSchema.safeParse(json);
    if (!parsed.success) {
      throw new ValidationError("Invalid member payload", parsed.error.flatten());
    }
    const member = await updateMember(memberId, parsed.data);
    revalidatePath(`/members/${memberId}`);
    return NextResponse.json({ ok: true, data: member });
  } catch (error) {
    const response = toErrorResponse(error);
    const status = getStatusFromError(error);
    return NextResponse.json(response, { status });
  }
}
