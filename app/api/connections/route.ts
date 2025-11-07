import { NextResponse } from "next/server";
import { getAuthenticatedMember } from "@/lib/auth/privy";
import { ConnectionCreateSchema } from "@/lib/db/validators";
import { createConnection } from "@/lib/db/repo";
import { toErrorResponse, ValidationError, getStatusFromError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const { memberId } = await getAuthenticatedMember(request);
    const json = await request.json();
    const parsed = ConnectionCreateSchema.safeParse(json);
    if (!parsed.success) {
      throw new ValidationError("Invalid connection payload", parsed.error.flatten());
    }
    const connection = await createConnection({
      from_member_id: memberId,
      to_member_id: parsed.data.to_member_id,
      relation: parsed.data.relation,
    });
    return NextResponse.json({ ok: true, data: connection });
  } catch (error) {
    const response = toErrorResponse(error);
    const status = getStatusFromError(error);
    return NextResponse.json(response, { status });
  }
}
