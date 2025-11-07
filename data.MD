# Data Model Reference

This document summarizes the relational model implemented in [`supabase/schema.sql`](./supabase/schema.sql) and mirrored in TypeScript through [`lib/db/types.ts`](./lib/db/types.ts) and the repository helpers in [`lib/db/repo.ts`](./lib/db/repo.ts).

## Core entities

### members
Stores the canonical identity for every Privy-authenticated person. Includes profile metadata (display name, avatar, level, bio) and an aggregate `reputation_score`. Timestamp columns (`created_at`, `updated_at`) are automatically managed via the `set_updated_at` trigger.

### member_contacts
Per-member contact handles (email, socials, etc.) tagged by `kind` and flagged for `is_public` display. Contacts cascade-delete when a member is removed.

### interests & member_interests
Curated list of interest tags and a join table connecting members to those tags. Interests are admin-managed only.

### member_goals
Goals authored by members, including `status`, optional `target_date`, and `privacy` (public/private). Non-public goals are hidden from other members.

### onboarding_submissions
Single-record form capturing the onboarding questionnaire for each authenticated member. Stores preferred `name`, `email`, motivations, creative ambitions, fun fact, and any shared links. Used to gate access to member-only surfaces until completed.

### communities, residencies, projects
Hierarchy describing where collaborations occur. Projects optionally belong to residencies and always to a community. Each project records the `created_by` member ID.

### project_participation
Join table between members and projects. Tracks `role`, `status`, and timestamps (`joined_at`, `left_at`). The kudos budget engine counts participations with `status = 'active'` as of a given day.

### kudos
Peer recognition events linking a `from_member` and `to_member` with optional `project_id`, bounded `weight` (1–5), note, and timestamp. Indexed for recipient and sender feeds.

### badges & member_badges
Catalog of available badges and awards granted to members. Awards capture the issuer (`awarded_by`), optional note, and timestamp.

### member_connections
Directed relationships between members with `relation` (follow/friend/collaborator) and `status` (pending/accepted/blocked). Used to calculate mutuals and drive social discovery.

### comments
Polymorphic comment thread entries scoped by `subject_type` and `subject_ref` (member, community, residency, or project).

## Shared enums

Custom Postgres enums define controlled vocabularies and are referenced throughout the schema:

- `member_level` – member lifecycle stage (`unchecked`, `in_person`, `guest`, `resident`, `manager`).
- `contact_kind` – supported contact channels (X, Substack, Instagram, Website, Email, Phone, Telegram, WhatsApp).
- `interest_kind` – categorization of curated interests (`hobby`, `skill`, `topic`).
- `goal_status` – lifecycle of a goal (`draft`, `active`, `paused`, `completed`, `archived`).
- `goal_privacy` – whether a goal is publicly visible.
- `project_role` – project participation role (`contributor`, `lead`, `mentor`, `observer`).
- `participation_status` – project engagement status (`invited`, `active`, `completed`, `dropped`).
- `badge_rarity` – rarity tiers for badges (`common` through `legendary`).
- `connection_relation` – social relationship types (`follow`, `friend`, `collaborator`).
- `connection_status` – state of the relationship (`pending`, `accepted`, `blocked`).
- `comment_subject` – allowed comment subject types (`member`, `community`, `residency`, `project`).

## Repository guarantees

The repository layer encapsulates access patterns and domain invariants:

- CRUD helpers for members, contacts, interests, goals, communities, residencies, projects, participations, kudos, badges, connections, and comments.
- Higher-level helpers for badge awarding (enforcing role-based rules), kudos budget accounting, and mutual connections lookups.
- Input validation via Zod schemas in [`lib/db/validators.ts`](./lib/db/validators.ts) ensures shape and enum correctness before interacting with the database.

Together, these layers keep the schema consistent between the database, server-side logic, and client components.
