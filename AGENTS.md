# Agent Guidelines

This project implements the Agartha members platform prototype using Next.js 15
(App Router) with Tailwind styling, Supabase Postgres for persistence, and Privy
for authentication. Keep these conventions in mind when making changes:

- Use **npm** for scripts and dependency management (`npm install`, `npm run lint`,
  `npm test`).
- Prefer **Server Components** for top-level routes and compose them from the
  shared UI primitives in `components/` (e.g., `components/ui/*`). Client
  components should focus on interactive pieces such as sheets, modals, and
  editors.
- Server-side mutations should live in App Router route handlers under `app/api`
  and must validate input with the Zod schemas in `lib/db/validators.ts`, verify
  Privy auth via `lib/auth/privy.ts`, and enforce authorization/budget helpers
  from `lib/authz` and `lib/kudos`.
- Keep database access funneled through the thin repository in `lib/db/repo.ts`
  with table definitions in `lib/db/types.ts`. Update the schema documentation
  (`data.MD`) and Supabase SQL (`supabase/schema.sql`) if the data model changes.
- After mutating server data, call `revalidatePath` for affected routes to keep
  caches fresh.
- Maintain unit tests in `tests/` (Vitest) when updating utility logic, and add
  snapshot coverage for UI components where it improves confidence.
- Update the documentation set (`readme.MD`, `flow.MD`, `UI.MD`) whenever feature
  flows or surface areas change.

Follow these practices to keep the prototype cohesive and aligned with the
current architecture.
