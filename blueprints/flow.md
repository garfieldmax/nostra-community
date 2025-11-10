# Product Flows

This guide walks through the primary end-to-end flows enabled by the Nostra Community prototype. Each flow references the API routes, repository helpers, and UI surfaces that collaborate to deliver the experience.

## Authentication & session bootstrap

1. Visitors can browse read-only routes like `/` and `/communities` without signing in. [`middleware.ts`](./middleware.ts) allows these paths but still attempts to resolve a Privy session so the `x-member-id` header is present when available.
2. When a visitor lands on `/login` and authenticates via Privy, the client redirects back to the requested path (default `/`).
3. Post-authentication, [`lib/onboarding.ts`](./lib/onboarding.ts) ensures the member record exists for the authenticated Privy user so protected routes have a stable `member_id` to operate with. Access is no longer gated on completing the onboarding questionnaire; communities can invite members to that flow separately when needed.

## Onboarding questionnaire

1. Communities can direct members to [`/onboarding`](./app/onboarding/page.tsx) to complete the intake form when they join a specific space.
2. The form posts to [`actions/onboarding.ts`](./actions/onboarding.ts), which validates input with [`OnboardingSubmissionSchema`](./lib/db/validators.ts), upserts into `onboarding_submissions`, and updates the member display name.
3. Successful submissions revalidate member-centric routes and return the user to `/`, but general navigation remains available regardless of completion.

## Member profile management

1. Members load `/members/[id]`, which renders [`components/MemberProfileShell.tsx`](./components/MemberProfileShell.tsx) to combine profile, contacts, badges, projects, kudos feed, and comments.
2. Inline edit controls trigger route handlers under `/api/members/[id]/*`, which validate input with [`lib/db/validators.ts`](./lib/db/validators.ts) and call repository helpers.
3. Public visitors see only public contacts and goals; private goals are filtered server-side.

## Connections & mutual discovery

1. The **Connect** CTA opens [`components/ConnectSheet.tsx`](./components/ConnectSheet.tsx), submitting to `/api/connections` or `/api/connections/[toMemberId]`.
2. Connection mutations are persisted via `repo.connections` helpers and validated with Zod.
3. [`lib/social/mutuals.ts`](./lib/social/mutuals.ts) resolves mutual connections for rendering in profile cards and the discovery page.
4. `/discover` uses [`components/DiscoveryList.tsx`](./components/DiscoveryList.tsx) to highlight mutual connections first, then shared-interest suggestions.

## Project management

1. Community managers visiting `/communities/[id]` see a **New project** button powered by [`ProjectListSection`](./components/communities/ProjectListSection.tsx). It launches [`components/projects/ProjectForm.tsx`](./components/projects/ProjectForm.tsx), which posts to `/api/projects` using `ProjectCreateSchema` and the `createProject` repository helper.
2. Editing an existing project opens the same form from [`ProjectPageShell`](./components/ProjectPageShell.tsx), targeting `/api/projects/[id]` (PATCH) to update name, description, or residency via `updateProject`.
3. Both mutations revalidate the community page, project detail, and `/projects` index so managers and members immediately see the updates.

## Project participation

1. `/projects/[id]` renders [`components/ProjectPageShell.tsx`](./components/ProjectPageShell.tsx) including roster, activity, and comments.
2. Join requests post to `/api/projects/[id]/join`, which now derives the participation status server-side: residents/managers become `active` immediately while others are stored as `invited` pending approval.
3. Community managers and project leads can approve pending members via `/api/projects/[id]/participants/[memberId]/approve`, which uses `setProjectParticipationStatus` to flip the record to `active` and revalidates the roster.
4. Active participations drive kudos budget allowances and roster sorting. `/projects` lists each member's active participations using `listActiveParticipationsForMember`.

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
