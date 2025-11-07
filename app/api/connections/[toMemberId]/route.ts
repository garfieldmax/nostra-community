import { NextResponse } from "next/server";
import { getAuthenticatedMember } from "@/lib/auth/privy";
import { ConnectionUpdateSchema } from "@/lib/db/validators";
import { updateConnectionStatus } from "@/lib/db/repo";
import { toErrorResponse, ValidationError, getStatusFromError } from "@/lib/errors";

interface RouteParams {
  params: Promise<{ toMemberId: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { toMemberId } = await params;
    const { memberId } = await getAuthenticatedMember(request);
    const json = await request.json();
    const parsed = ConnectionUpdateSchema.safeParse({ ...json, to_member_id: toMemberId });
    if (!parsed.success) {
      throw new ValidationError("Invalid connection update payload", parsed.error.flatten());
    }
    const connection = await updateConnectionStatus(
      parsed.data.to_member_id,
      memberId,
      parsed.data.relation,
      parsed.data.status
    );
    return NextResponse.json({ ok: true, data: connection });
  } catch (error) {
    const response = toErrorResponse(error);
    const status = getStatusFromError(error);
    return NextResponse.json(response, { status });
  }
}
