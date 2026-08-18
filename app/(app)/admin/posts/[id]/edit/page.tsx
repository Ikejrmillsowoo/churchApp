// app/(app)/admin/posts/[id]/edit/page.tsx — admin form to edit an existing post.
import { notFound } from "next/navigation";
import { publishPost, saveDraft } from "@/app/(app)/admin/posts/actions";
import { PostForm } from "@/components/post-form";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single<Post>();
  if (!data) notFound();

  return (
    <main className="flex flex-1 flex-col gap-6 px-5 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Edit post</h1>
      <PostForm
        saveDraft={saveDraft}
        publishPost={publishPost}
        post={data}
        error={error}
      />
    </main>
  );
}
