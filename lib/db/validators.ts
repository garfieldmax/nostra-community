import { z } from "zod";

export const MemberUpdateSchema = z.object({
  display_name: z.string().min(1).max(120).optional(),
  bio: z.string().max(2048).optional(),
  level: z.enum(["unchecked", "in_person", "guest", "resident", "manager"]).optional(),
  avatar_url: z.string().url().optional().nullable(),
});

export const ContactCreateSchema = z.object({
  member_id: z.string(),
  kind: z.enum(["x", "substack", "instagram", "website", "email", "phone", "telegram", "whatsapp"]),
  handle: z.string().min(1).max(255),
  url: z.string().url().nullable().default(null),
  is_public: z.boolean().default(true),
});

export const InterestUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().min(1).max(120),
  kind: z.enum(["hobby", "skill", "topic"]),
});

export const MemberInterestsSchema = z.object({
  interestIds: z.array(z.string().uuid()).max(32),
});

export const GoalCreateSchema = z.object({
  member_id: z.string(),
  title: z.string().min(1).max(160),
  details: z.string().max(2000).nullable().optional(),
  status: z.enum(["draft", "active", "paused", "completed", "archived"]).default("active"),
  target_date: z.string().nullable().optional(),
  privacy: z.enum(["public", "private"]).default("public"),
});

export const GoalUpdateSchema = GoalCreateSchema.partial().extend({
  id: z.string().uuid(),
});

export const KudosCreateSchema = z.object({
  to_member_id: z.string(),
  project_id: z.string().uuid().optional().nullable(),
  weight: z.number().min(1).max(5),
  note: z.string().max(500).optional().nullable(),
});

export const ConnectionCreateSchema = z.object({
  to_member_id: z.string(),
  relation: z.enum(["follow", "friend", "collaborator"]),
});

export const ConnectionUpdateSchema = ConnectionCreateSchema.extend({
  status: z.enum(["pending", "accepted", "blocked"]),
});

export const BadgeAwardSchema = z.object({
  member_id: z.string(),
  badge_id: z.string().uuid(),
  note: z.string().max(500).optional().nullable(),
  context: z
    .object({
      community_id: z.string().uuid().optional(),
      project_id: z.string().uuid().optional(),
    })
    .optional(),
});

export const BadgeUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(120),
  name: z.string().min(1).max(120),
  description: z.string().max(500).nullable().optional(),
  rarity: z.enum(["common", "uncommon", "rare", "epic", "legendary"]),
  icon_url: z.string().url().nullable().optional(),
});

export const CommentCreateSchema = z.object({
  subject_type: z.enum(["member", "community", "residency", "project"]),
  subject_ref: z.string(),
  body: z.string().min(1).max(1500),
});

export const ProjectJoinSchema = z.object({
  project_id: z.string().uuid(),
  role: z.enum(["contributor", "lead", "mentor", "observer"]).default("contributor"),
  status: z.enum(["invited", "active", "completed", "dropped"]).default("active"),
});

export const OnboardingSubmissionSchema = z.object({
  name: z.string().min(1).max(120).trim(),
  email: z.string().email().trim(),
  whyJoin: z.string().min(1).max(2000).trim(),
  whatCreate: z.string().min(1).max(2000).trim(),
  coolFact: z.string().min(1).max(2000).trim(),
  links: z
    .string()
    .max(1000)
    .transform((value) => value.trim())
    .optional()
    .or(z.literal(""))
    .transform((value) => (value && value.length > 0 ? value : undefined)),
});
