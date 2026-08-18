// app/(app)/admin/posts/actions.ts — admin create/update/publish/delete actions for posts.
// Guarded by isAdmin() in addition to RLS (which restricts writes to admins).
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { notifyMentions } from "@/lib/notify-mentions";
import { createClient } from "@/lib/supabase/server";

type PostFields = {
  title: string | null;
  body: string;
};

function readFields(formData: FormData): PostFields {
  return {
    title: String(formData.get("title") ?? "").trim() || null,
    body: String(formData.get("body") ?? "").trim(),
  };
}

async function savePost(
  formData: FormData,
  status: "draft" | "published",
) {
  if (!(await isAdmin())) redirect("/");
  const id = String(formData.get("id") ?? "");
  const fields = readFields(formData);

  if (!fields.body) {
    const target = id ? `/admin/posts/${id}/edit` : "/admin/posts/new";
    redirect(`${target}?error=Post+body+is+required`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = {
    ...fields,
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
  };

  const { data: saved, error } = id
    ? await supabase
        .from("posts")
        .update(payload)
        .eq("id", id)
        .select("id")
        .single()
    : await supabase
        .from("posts")
        .insert({ ...payload, author_id: user?.id ?? null })
        .select("id")
        .single();

  if (error) {
    const target = id ? `/admin/posts/${id}/edit` : "/admin/posts/new";
    redirect(`${target}?error=${encodeURIComponent(error.message)}`);
  }

  if (status === "published" && user && saved) {
    await notifyMentions(supabase, user.id, fields.body, {
      postId: saved.id as string,
    });
  }

  revalidatePath("/admin/posts");
  revalidatePath("/feed");
  redirect("/admin/posts");
}

export async function saveDraft(formData: FormData) {
  await savePost(formData, "draft");
}

export async function publishPost(formData: FormData) {
  await savePost(formData, "published");
}

export async function unpublishPost(formData: FormData) {
  if (!(await isAdmin())) redirect("/");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase
    .from("posts")
    .update({ status: "draft", published_at: null })
    .eq("id", id);

  revalidatePath("/admin/posts");
  revalidatePath("/feed");
}

export async function setPostPinned(formData: FormData) {
  if (!(await isAdmin())) redirect("/");
  const id = String(formData.get("id") ?? "");
  const pinned = formData.get("pinned") === "true";
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("posts").update({ pinned }).eq("id", id);

  revalidatePath("/admin/posts");
  revalidatePath("/feed");
}

export async function deletePost(formData: FormData) {
  if (!(await isAdmin())) redirect("/");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("posts").delete().eq("id", id);

  revalidatePath("/admin/posts");
  revalidatePath("/feed");
}
