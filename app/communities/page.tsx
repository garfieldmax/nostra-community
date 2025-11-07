import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { listCommunities } from "@/lib/db/repo";

export const dynamic = "force-dynamic";

type CommunitiesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CommunitiesPage({ searchParams }: CommunitiesPageProps) {
  const params = await searchParams;
  const searchParam = Array.isArray(params?.q) ? params?.q[0] : params?.q;
  const query = typeof searchParam === "string" ? searchParam : "";
  const communities = await listCommunities({ search: query });
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-slate-900">Communities</h1>
      <p className="text-sm text-slate-600">Browse the Agartha communities and find your next residency or project.</p>
      <form className="mt-6 flex flex-col gap-2 md:flex-row md:items-center" action="/communities">
        <Input
          name="q"
          defaultValue={query}
          placeholder="Search communities by name or description"
          className="md:w-80"
        />
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-slate-800"
        >
          Search
        </button>
        {query && (
          <Link href="/communities" className="text-sm text-slate-500 transition hover:text-slate-700">
            Clear
          </Link>
        )}
      </form>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {communities.map((community) => (
          <Link key={community.id} href={`/communities/${community.id}`}>
            <Card className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">{community.name}</h2>
              {community.description && <p className="text-sm text-slate-600">{community.description}</p>}
            </Card>
          </Link>
        ))}
        {communities.length === 0 && (
          <Card className="p-6 text-sm text-slate-600">
            No communities found for “{query}”. Try a different search or clear the filter.
          </Card>
        )}
      </div>
    </div>
  );
}
