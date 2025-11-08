import Link from "next/link";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-white px-4 py-12">
      <div className="mx-auto w-full max-w-xl space-y-6 text-center">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">404</p>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Page not found</h1>
          <p className="text-base text-slate-600">
            The page you are looking for might have been removed, renamed, or is
            temporarily unavailable.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Go back
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
