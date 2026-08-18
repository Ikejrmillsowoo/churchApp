// app/(app)/feed/actions.ts — participant engagement actions: like/unlike a post, and
// add/edit/delete comments. Comment moderation (hide/unhide) is admin-only. RLS is the
// source of truth for who may do what; isAdmin() checks here are UX-only guards.
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { notifyMentions } from "@/lib/notify-mentions";
import { createClient } from "@/lib/supabase/server";

export async function likePost(formData: FormData) {
  const postId = String(formData.get("post_id") ?? "");
  if (!postId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("post_likes")
    .upsert(
      { post_id: postId, user_id: user.id },
      { onConflict: "post_id,user_id", ignoreDuplicates: true },
    );

  revalidatePath(`/feed/${postId}`);
  revalidatePath("/feed");
}

export async function unlikePost(formData: FormData) {
  const postId = String(formData.get("post_id") ?? "");
  if (!postId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("post_likes")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", user.id);

  revalidatePath(`/feed/${postId}`);
  revalidatePath("/feed");
}

export async function addComment(formData: FormData) {
  const postId = String(formData.get("post_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!postId || !body) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: comment } = await supabase
    .from("comments")
    .insert({ post_id: postId, author_id: user.id, body })
    .select("id")
    .single();

  if (comment) {
    await notifyMentions(supabase, user.id, body, {
      postId,
      commentId: comment.id as string,
    });
  }

  revalidatePath(`/feed/${postId}`);
}

export async function updateComment(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const postId = String(formData.get("post_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!id || !postId || !body) return;

  const supabase = await createClient();
  await supabase.from("comments").update({ body }).eq("id", id);

  revalidatePath(`/feed/${postId}`);
}

export async function deleteComment(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const postId = String(formData.get("post_id") ?? "");
  if (!id || !postId) return;

  const supabase = await createClient();
  await supabase.from("comments").delete().eq("id", id);

  revalidatePath(`/feed/${postId}`);
}

export async function hideComment(formData: FormData) {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") ?? "");
  const postId = String(formData.get("post_id") ?? "");
  if (!id || !postId) return;

  const supabase = await createClient();
  await supabase.from("comments").update({ hidden: true }).eq("id", id);

  revalidatePath(`/feed/${postId}`);
}

export async function unhideComment(formData: FormData) {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") ?? "");
  const postId = String(formData.get("post_id") ?? "");
  if (!id || !postId) return;

  const supabase = await createClient();
  await supabase.from("comments").update({ hidden: false }).eq("id", id);

  revalidatePath(`/feed/${postId}`);
}
