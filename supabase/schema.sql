-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Grant permissions
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables in schema public to postgres, anon, authenticated, service_role;
grant all on all sequences in schema public to postgres, anon, authenticated, service_role;
grant all on all functions in schema public to postgres, anon, authenticated, service_role;

-- Default privileges for future objects
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;

-- Enums
create type public.member_level as enum (
  'unchecked',
  'in_person',
  'guest',
  'resident',
  'manager'
);

create type public.contact_kind as enum (
  'x',
  'substack',
  'instagram',
  'website',
  'email',
  'phone',
  'telegram',
  'whatsapp'
);

create type public.interest_kind as enum (
  'hobby',
  'skill',
  'topic'
);

create type public.goal_status as enum (
  'draft',
  'active',
  'paused',
  'completed',
  'archived'
);

create type public.goal_privacy as enum ('public', 'private');

create type public.project_role as enum (
  'contributor',
  'lead',
  'mentor',
  'observer'
);

create type public.participation_status as enum (
  'invited',
  'active',
  'completed',
  'dropped'
);

create type public.badge_rarity as enum (
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary'
);

create type public.connection_relation as enum (
  'follow',
  'friend',
  'collaborator'
);

create type public.connection_status as enum (
  'pending',
  'accepted',
  'blocked'
);

create type public.comment_subject as enum (
  'member',
  'community',
  'residency',
  'project'
);

-- Trigger helper for updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Members
create table if not exists public.members (
  id text primary key,
  display_name text not null,
  avatar_url text,
  level public.member_level not null default 'unchecked',
  bio text,
  reputation_score integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_members_level on public.members(level);
create index if not exists idx_members_reputation on public.members(reputation_score desc);
create trigger trg_members_updated
before update on public.members
for each row execute function public.set_updated_at();

-- Member contacts
create table if not exists public.member_contacts (
  id uuid primary key default gen_random_uuid(),
  member_id text not null references public.members(id) on delete cascade,
  kind public.contact_kind not null,
  handle text not null,
  url text,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_member_contacts_member on public.member_contacts(member_id);
create index if not exists idx_member_contacts_public on public.member_contacts(member_id) where is_public;

-- Interests
create table if not exists public.interests (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  kind public.interest_kind not null
);
create unique index if not exists idx_interests_label on public.interests(lower(label));

create table if not exists public.member_interests (
  member_id text not null references public.members(id) on delete cascade,
  interest_id uuid not null references public.interests(id) on delete cascade,
  primary key (member_id, interest_id)
);
create index if not exists idx_member_interests_interest on public.member_interests(interest_id);

-- Goals
create table if not exists public.member_goals (
  id uuid primary key default gen_random_uuid(),
  member_id text not null references public.members(id) on delete cascade,
  title text not null,
  details text,
  status public.goal_status not null default 'active',
  target_date date,
  privacy public.goal_privacy not null default 'public',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_member_goals_member on public.member_goals(member_id);
create trigger trg_member_goals_updated
before update on public.member_goals
for each row execute function public.set_updated_at();

-- Communities
create table if not exists public.communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_communities_name on public.communities using gin (to_tsvector('simple', name));
create trigger trg_communities_updated
before update on public.communities
for each row execute function public.set_updated_at();

-- Residencies
create table if not exists public.residencies (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  name text not null,
  description text,
  dates daterange,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_residencies_community on public.residencies(community_id);
create trigger trg_residencies_updated
before update on public.residencies
for each row execute function public.set_updated_at();

-- Projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  residency_id uuid references public.residencies(id) on delete set null,
  name text not null,
  description text,
  created_by text not null references public.members(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_projects_community on public.projects(community_id);
create index if not exists idx_projects_residency on public.projects(residency_id);
create trigger trg_projects_updated
before update on public.projects
for each row execute function public.set_updated_at();

-- Project participation
create table if not exists public.project_participation (
  project_id uuid not null references public.projects(id) on delete cascade,
  member_id text not null references public.members(id) on delete cascade,
  role public.project_role not null default 'contributor',
  status public.participation_status not null default 'active',
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  primary key (project_id, member_id)
);
create index if not exists idx_participation_member on public.project_participation(member_id);
create index if not exists idx_participation_status on public.project_participation(status);

-- Kudos
create table if not exists public.kudos (
  id uuid primary key default gen_random_uuid(),
  from_member_id text not null references public.members(id) on delete cascade,
  to_member_id text not null references public.members(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  weight smallint not null check (weight between 1 and 5),
  note text,
  created_at timestamptz not null default now()
);
create index if not exists idx_kudos_to on public.kudos(to_member_id, created_at desc);
create index if not exists idx_kudos_from on public.kudos(from_member_id, created_at desc);
create index if not exists idx_kudos_project on public.kudos(project_id);

-- Badges
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  description text,
  rarity public.badge_rarity not null,
  icon_url text
);
create unique index if not exists idx_badges_slug on public.badges(lower(slug));

create table if not exists public.member_badges (
  member_id text not null references public.members(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  awarded_by text not null references public.members(id) on delete restrict,
  note text,
  primary key (member_id, badge_id)
);
create index if not exists idx_member_badges_badge on public.member_badges(badge_id);

-- Connections
create table if not exists public.member_connections (
  from_member_id text not null references public.members(id) on delete cascade,
  to_member_id text not null references public.members(id) on delete cascade,
  relation public.connection_relation not null,
  status public.connection_status not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  primary key (from_member_id, to_member_id, relation)
);
create index if not exists idx_member_connections_reverse on public.member_connections(to_member_id, from_member_id);
create index if not exists idx_member_connections_status on public.member_connections(status);

-- Comments
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  subject_type public.comment_subject not null,
  subject_ref text not null,
  author_id text not null references public.members(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_comments_subject on public.comments(subject_type, subject_ref, created_at desc);
create index if not exists idx_comments_author on public.comments(author_id);

-- Disable RLS (auth handled via Privy)
alter table public.members disable row level security;
alter table public.member_contacts disable row level security;
alter table public.interests disable row level security;
alter table public.member_interests disable row level security;
alter table public.member_goals disable row level security;
alter table public.communities disable row level security;
alter table public.residencies disable row level security;
alter table public.projects disable row level security;
alter table public.project_participation disable row level security;
alter table public.kudos disable row level security;
alter table public.badges disable row level security;
alter table public.member_badges disable row level security;
alter table public.member_connections disable row level security;
alter table public.comments disable row level security;
