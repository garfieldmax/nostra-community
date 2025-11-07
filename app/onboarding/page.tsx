import Link from "next/link";
import { redirect } from "next/navigation";

import { submitOnboarding } from "@/actions/onboarding";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { getOnboardingStatus } from "@/lib/onboarding";

export const dynamic = "force-dynamic";

type OnboardingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams;
  const errorParam = Array.isArray(params?.error) ? params?.error[0] : params?.error;

  const { user, submission } = await getOnboardingStatus();
  if (!user) {
    redirect("/login?redirect=/onboarding");
  }
  if (submission) {
    redirect("/");
  }

  const email = user.email ?? "";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold text-slate-900">Tell us about you</h1>
        <p className="text-sm text-slate-600">
          Share a few details so the Agartha team can welcome you and match you with the right communities.
        </p>
      </div>
      {errorParam === "validation" && (
        <Card className="border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Something went wrong saving your answers. Please double-check the fields and try again.
        </Card>
      )}
      <Card className="p-6">
        <form action={submitOnboarding} className="space-y-5">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium text-slate-700">
              Name
            </label>
            <Input id="name" name="name" required placeholder="How should we call you?" />
          </div>
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email
            </label>
            <Input id="email" name="email" type="email" defaultValue={email} required placeholder="you@example.com" />
          </div>
          <div className="grid gap-2">
            <label htmlFor="whyJoin" className="text-sm font-medium text-slate-700">
              Why do you want to join?
            </label>
            <Textarea
              id="whyJoin"
              name="whyJoin"
              required
              rows={3}
              placeholder="Let us know what drew you to Agartha."
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="whatCreate" className="text-sm font-medium text-slate-700">
              What do you want to create?
            </label>
            <Textarea
              id="whatCreate"
              name="whatCreate"
              required
              rows={3}
              placeholder="Share a project, community, or experience you want to build."
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="coolFact" className="text-sm font-medium text-slate-700">
              One cool fact about you
            </label>
            <Textarea
              id="coolFact"
              name="coolFact"
              required
              rows={3}
              placeholder="Tell us something memorable so we can introduce you properly."
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="links" className="text-sm font-medium text-slate-700">
              Links (website, LinkedIn, X, Substack, etc.)
            </label>
            <Textarea
              id="links"
              name="links"
              rows={3}
              placeholder="Drop any links you want to share. Separate each link on its own line."
            />
          </div>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-slate-800"
            >
              Submit onboarding
            </button>
            <p className="text-xs text-slate-500">
              Need help? <Link href="mailto:team@agartha.com" className="text-slate-700 underline">Email the team</Link>.
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}
