import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedMember } from "@/lib/auth/privy";
import { ContactCreateSchema } from "@/lib/db/validators";
import { createMemberContact } from "@/lib/db/repo";
import { AuthorizationError, toErrorResponse, ValidationError } from "@/lib/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { memberId } = await getAuthenticatedMember(request);
    if (memberId !== id) {
      throw new AuthorizationError("You can only manage your own contacts");
    }
    const json = await request.json();
    const parsed = ContactCreateSchema.safeParse({ ...json, member_id: memberId });
    if (!parsed.success) {
      throw new ValidationError("Invalid contact payload", parsed.error.flatten());
    }
    const contact = await createMemberContact(parsed.data);
    revalidatePath(`/members/${memberId}`);
    return NextResponse.json({ ok: true, data: contact });
  } catch (error) {
    const response = toErrorResponse(error);
    const status = response.error.code === "VALIDATION_FAILED" ? 400 : response.error.code === "FORBIDDEN" ? 403 : response.error.code === "UNAUTHENTICATED" ? 401 : 500;
    return NextResponse.json(response, { status });
  }
}
