import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/privy";

export type User = {
  id: string;
  email?: string;
  createdAt: number;
  linkedAccounts: Array<{
    type: string;
    address?: string;
    email?: string;
  }>;
};

export async function getUser(): Promise<User | null> {
  try {
    const session = await getSessionUser();
    if (!session) {
      return null;
    }

    return {
      id: session.id,
      email: session.email,
      createdAt: session.createdAt,
      linkedAccounts: session.linkedAccounts,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isDynamicServerError =
      errorMessage.includes("Dynamic server usage") ||
      errorMessage.includes("couldn't be rendered statically") ||
      errorMessage.includes("cookies");

    if (isDynamicServerError) {
      return null;
    }

    console.error("[getUser] Unexpected error:", {
      error: errorMessage,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
    });

    return null;
  }
}

export async function requireUser() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
