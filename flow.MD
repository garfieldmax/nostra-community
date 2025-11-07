# Product Flows

This guide walks through the primary end-to-end flows enabled by the Agartha prototype. Each flow references the API routes, repository helpers, and UI surfaces that collaborate to deliver the experience.

## Authentication & session bootstrap

1. Visitors can browse read-only routes like `/` and `/communities` without signing in. [`middleware.ts`](./middleware.ts) allows these paths but still attempts to resolve a Privy session so the `x-member-id` header is present when available.
2. When a visitor lands on `/login` and authenticates via Privy, the client redirects back to the requested path (default `/`).
3. Post-authentication, [`lib/onboarding.ts`](./lib/onboarding.ts) ensures the member record exists and checks for an onboarding submission before granting access to protected surfaces. Requests without a completed submission are redirected to `/onboarding`.

## Onboarding questionnaire

1. Newly authenticated members are routed to [`/onboarding`](./app/onboarding/page.tsx) to complete the required intake form.
2. The form posts to [`actions/onboarding.ts`](./actions/onboarding.ts), which validates input with [`OnboardingSubmissionSchema`](./lib/db/validators.ts), upserts into `onboarding_submissions`, and updates the member display name.
3. Successful submissions revalidate member-centric routes and return the user to `/`, unlocking Members navigation and discovery tools.

## Member profile management

1. Members load `/members/[id]`, which renders [`components/MemberProfileShell.tsx`](./components/MemberProfileShell.tsx) to combine profile, contacts, badges, projects, kudos feed, and comments.
2. Inline edit controls trigger route handlers under `/api/members/[id]/*`, which validate input with [`lib/db/validators.ts`](./lib/db/validators.ts) and call repository helpers.
3. Public visitors see only public contacts and goals; private goals are filtered server-side.

## Connections & mutual discovery

1. The **Connect** CTA opens [`components/ConnectSheet.tsx`](./components/ConnectSheet.tsx), submitting to `/api/connections` or `/api/connections/[toMemberId]`.
2. Connection mutations are persisted via `repo.connections` helpers and validated with Zod.
3. [`lib/social/mutuals.ts`](./lib/social/mutuals.ts) resolves mutual connections for rendering in profile cards and the discovery page.
4. `/discover` uses [`components/DiscoveryList.tsx`](./components/DiscoveryList.tsx) to highlight mutual connections first, then shared-interest suggestions.

## Project participation

1. `/projects/[id]` renders [`components/ProjectPageShell.tsx`](./components/ProjectPageShell.tsx) including roster, activity, and comments.
2. Join/leave actions hit `/api/projects/[id]/join` or `/api/projects/[id]/leave`, which validate payloads, call participation repo helpers, and revalidate project routes.
3. Active participations drive kudos budget allowances and roster sorting.

## Kudos budgeting & feed

1. The **Give Kudos** modal (`components/GiveKudosModal.tsx`) posts to `/api/kudos`.
2. Route handler validates payload, resolves active participations via [`lib/kudos/budget.ts`](./lib/kudos/budget.ts), and calls `assertKudosBudget` before inserting a kudos record.
3. Successful kudos updates member reputation and appears in `/members/[id]` kudos feed via `repo.kudos.listReceived`.

## Badges awarding

1. Community managers (from `repo.communities.getManagers`) and project leads (from `repo.projects.getLeads`) are determined by [`lib/authz/roles.ts`](./lib/authz/roles.ts).
2. Admins manage badge catalog at `/admin/badges`. Awarding a badge submits to `/api/badges/award` with the target `member_id` and `badge_id`.
3. Route handler checks authorization, validates payload, and creates or updates `member_badges` entries.

## Admin-curated interests

1. `/admin/interests` lists existing interest tags and allows creation/deletion via repository helpers.
2. Interests surface on profile edit flows and discovery suggestions but remain locked behind admin-only routes.

## Comments

1. `components/CommentsThread.tsx` renders comments scoped to a subject (member/project/community/residency).
2. Posting a comment hits `/api/comments`, which validates body text and persists to `comments` with the author member ID.
3. Feeds refresh via `revalidatePath` to surface the new comment instantly.

These flows combine to support member onboarding, collaboration, recognition, and discovery while enforcing privacy, authorization, and rate limits.
