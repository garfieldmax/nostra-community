export type Level = "unchecked" | "in_person" | "guest" | "resident" | "manager";

export interface Member {
  id: string;
  display_name: string;
  avatar_url: string | null;
  level: Level;
  bio: string | null;
  reputation_score: number;
  created_at: string;
  updated_at: string;
}

export type ContactKind =
  | "x"
  | "substack"
  | "instagram"
  | "website"
  | "email"
  | "phone"
  | "telegram"
  | "whatsapp";

export interface MemberContact {
  id: string;
  member_id: string;
  kind: ContactKind;
  handle: string;
  url: string | null;
  is_public: boolean;
  created_at: string;
}

export type InterestKind = "hobby" | "skill" | "topic";

export interface Interest {
  id: string;
  label: string;
  kind: InterestKind;
}

export interface MemberInterest {
  member_id: string;
  interest_id: string;
}

export type GoalStatus = "draft" | "active" | "paused" | "completed" | "archived";

export type GoalPrivacy = "public" | "private";

export interface MemberGoal {
  id: string;
  member_id: string;
  title: string;
  details: string | null;
  status: GoalStatus;
  target_date: string | null;
  created_at: string;
  updated_at: string;
  privacy: GoalPrivacy;
}

export interface Community {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Residency {
  id: string;
  community_id: string;
  name: string;
  description: string | null;
  dates: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  community_id: string;
  residency_id: string | null;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type ProjectRole = "contributor" | "lead" | "mentor" | "observer";
export type ParticipationStatus = "invited" | "active" | "completed" | "dropped";

export interface ProjectParticipation {
  project_id: string;
  member_id: string;
  role: ProjectRole;
  status: ParticipationStatus;
  joined_at: string;
  left_at: string | null;
  project?: Project | null;
  member?: Member | null;
}

export interface Kudos {
  id: string;
  from_member_id: string;
  to_member_id: string;
  project_id: string | null;
  weight: number;
  note: string | null;
  created_at: string;
  project?: Project | null;
  from_member?: Member | null;
}

export type BadgeRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  rarity: BadgeRarity;
  icon_url: string | null;
}

export interface MemberBadge {
  member_id: string;
  badge_id: string;
  awarded_at: string;
  awarded_by: string;
  note: string | null;
  badge?: Badge;
}

export type ConnectionRelation = "follow" | "friend" | "collaborator";
export type ConnectionStatus = "pending" | "accepted" | "blocked";

export interface MemberConnection {
  from_member_id: string;
  to_member_id: string;
  relation: ConnectionRelation;
  status: ConnectionStatus;
  created_at: string;
  responded_at: string | null;
}

export type CommentSubject = "member" | "community" | "residency" | "project";

export interface Comment {
  id: string;
  subject_type: CommentSubject;
  subject_ref: string;
  author_id: string;
  body: string;
  created_at: string;
}

export interface OnboardingSubmission {
  member_id: string;
  name: string;
  email: string;
  why_join: string;
  what_create: string;
  cool_fact: string;
  links: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileSummary {
  member: Member;
  contacts: MemberContact[];
  interests: Interest[];
  badges: MemberBadge[];
  goals: MemberGoal[];
  activeParticipations: ProjectParticipation[];
}
