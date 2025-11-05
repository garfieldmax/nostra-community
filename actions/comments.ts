"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabaseServer";
import { DEMO_COMMENTS } from "@/lib/demo-data";

export type CommentWithAuthor = {
  id: string;
  subject_type: CommentSubject;
  subject_id: string;
  author_id: string;
  body: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

type CommentSubject = "user" | "community" | "residency";

export async function listComments(
  subject_type: CommentSubject,
  subject_id: string
): Promise<CommentWithAuthor[]> {
  try {
    const supabase = await supabaseServer();
    const { data, error } = await supabase
      .from("comments")
      .select(
        "id, subject_type, subject_id, author_id, body, created_at, updated_at, profiles:author_id(display_name, avatar_url)"
      )
      .eq("subject_type", subject_type)
      .eq("subject_id", subject_id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    // Transform Supabase response to match CommentWithAuthor type
    // Supabase returns profiles as an array, but we need a single object
    return (data ?? []).map((comment) => ({
      ...comment,
      profiles: Array.isArray(comment.profiles) && comment.profiles.length > 0
        ? comment.profiles[0]
        : null,
    }));
  } catch {
    return DEMO_COMMENTS.filter(
      (comment) => comment.subject_type === subject_type && comment.subject_id === subject_id
    );
  }
}

export async function addComment(input: {
  subject_type: CommentSubject;
  subject_id: string;
  body: string;
}) {
  const supabase = await supabaseServer();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase.from("comments").insert({
    subject_type: input.subject_type,
    subject_id: input.subject_id,
    body: input.body,
    author_id: user.id,
  });

  if (error) {
    throw error;
  }

  revalidatePath("/dashboard");
}
