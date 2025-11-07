import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAuthenticatedMember } from "@/lib/auth/privy";
import { KudosCreateSchema } from "@/lib/db/validators";
import { assertKudosBudget } from "@/lib/kudos/budget";
import { createKudos, listKudosForMember } from "@/lib/db/repo";
import { toErrorResponse, ValidationError, getStatusFromError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const { memberId } = await getAuthenticatedMember(request);
    const json = await request.json();
    const parsed = KudosCreateSchema.safeParse(json);
    if (!parsed.success) {
      throw new ValidationError("Invalid kudos payload", parsed.error.flatten());
    }
    await assertKudosBudget(memberId, new Date());
    const record = await createKudos({
      from_member_id: memberId,
      to_member_id: parsed.data.to_member_id,
      project_id: parsed.data.project_id,
      weight: parsed.data.weight,
      note: parsed.data.note,
    });
    revalidatePath(`/members/${parsed.data.to_member_id}`);
    return NextResponse.json({ ok: true, data: record });
  } catch (error) {
    const response = toErrorResponse(error);
    const status = getStatusFromError(error);
    return NextResponse.json(response, { status });
  }
}

export async function GET(request: Request) {
  try {
    await getAuthenticatedMember(request);
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");
    if (!memberId) {
      throw new ValidationError("memberId is required");
    }
    const kudos = await listKudosForMember(memberId);
    return NextResponse.json({ ok: true, data: kudos });
  } catch (error) {
    const response = toErrorResponse(error);
    const status = getStatusFromError(error);
    return NextResponse.json(response, { status });
  }
}
