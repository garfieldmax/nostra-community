import type { ReactNode } from "react";
import { getUser } from "@/lib/auth";

// Mark dashboard routes as dynamic since they use cookies for authentication
export const dynamic = 'force-dynamic';

export default async function DashboardShell({
  children,
}: Readonly<{ children: ReactNode }>) {
  const user = await getUser();

  return (
    <div className="flex min-h-dvh flex-col bg-slate-100">
      {!user && (
        <div className="border-b border-dashed bg-amber-50 text-amber-900">
          <div className="mx-auto w-full max-w-6xl px-4 py-2 text-sm">
            Demo mode: connect Privy auth to enable sign-in and live data.
          </div>
        </div>
      )}
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6">{children}</div>
      </main>
    </div>
  );
}
