# Agartha Members Platform

Agartha is a members-first collaboration platform that connects residents, alumni, and collaborators across communities, residencies, and projects. This documentation set explains how the prototype is structured and how to operate the core platform experiences implemented in this repository.

- [`readme.MD`](./readme.MD) – product overview (this file)
- [`data.MD`](./data.MD) – database schema and persistence notes
- [`flow.MD`](./flow.MD) – end-to-end member, project, kudos, and badge flows
- [`UI.MD`](./UI.MD) – application surfaces and shared UI components
- [`supabase/reset_schema.sql`](./supabase/reset_schema.sql) – SQL script to drop any legacy schema and apply the current ERD

## Platform pillars

1. **Identity** – Privy provides authentication; every signed-in person maps 1:1 to a `members` record keyed by their Privy DID.
2. **Participation** – Members collaborate inside communities, residencies, and projects, with participation roles and statuses represented in `project_participation`.
3. **Recognition** – Kudos, badges, goals, and comments celebrate contributions and keep the social graph active.
4. **Discovery** – Mutual connections, shared interests, and trending members power the `/discover` page and profile cards.

## Key capabilities delivered

- Server middleware that validates Privy JWTs and injects `memberId` into request context.
- Supabase repository layer (`lib/db/repo.ts`) encapsulating reads/mutations across members, communities, residencies, projects, kudos, badges, connections, comments, and curated interests.
- Kudos budget engine ensuring each member can only send one kudos per active project participation per day.
- Authorization helpers (`lib/authz/roles.ts`) restricting badge awarding to community managers and project leads.
- App Router pages for login, home (members & communities tabs), member profiles, project detail, community explorer, discovery, and admin-only interests/badges curation.
- Tailwind-based component library for profile cards, contact lists, badges, interests, goals, project rosters, kudos feeds, comments, and social discovery surfaces.
- Route handlers and server actions that combine authentication, validation (Zod), authorization, and domain rules for kudos, connections, badges, profile edits, participation, and comments.
- Vitest unit tests for the kudos budget engine and badge authorization, plus snapshot tests for discovery mutual rendering.

Refer to the companion documents for deeper dives into data modeling, user flows, and UI architecture.
