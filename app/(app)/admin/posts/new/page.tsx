// app/(app)/admin/posts/new/page.tsx — admin form to write a new post.
import { publishPost, saveDraft } from "@/app/(app)/admin/posts/actions";
import { PostForm } from "@/components/post-form";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex flex-1 flex-col gap-6 px-5 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">New post</h1>
      <PostForm saveDraft={saveDraft} publishPost={publishPost} error={error} />
    </main>
  );
}
