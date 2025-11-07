import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { Community } from "@/lib/db/types";

type CommunitySearchListProps = {
  communities: Community[];
  searchQuery: string;
  formAction: string;
  clearHref: string;
  hiddenFields?: Array<{ name: string; value: string }>;
};

export function CommunitySearchList({
  communities,
  searchQuery,
  formAction,
  clearHref,
  hiddenFields,
}: CommunitySearchListProps) {
  return (
    <div className="space-y-6">
      <form className="flex flex-col gap-2 md:flex-row md:items-center" action={formAction}>
        {hiddenFields?.map((field) => (
          <input key={field.name} type="hidden" name={field.name} value={field.value} />
        ))}
        <Input
          name="q"
          defaultValue={searchQuery}
          placeholder="Search communities by name or description"
          className="md:w-80"
        />
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-slate-800"
        >
          Search
        </button>
        {searchQuery && (
          <Link href={clearHref} className="text-sm text-slate-500 transition hover:text-slate-700">
            Clear
          </Link>
        )}
      </form>
      <div className="grid gap-6 md:grid-cols-2">
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
            {searchQuery
              ? `No communities found for "${searchQuery}". Try a different search or clear the filter.`
              : "No communities match your search yet. Try a different phrase or clear the filter."}
          </Card>
        )}
      </div>
    </div>
  );
}

