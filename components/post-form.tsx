// components/post-form.tsx — shared create/edit form for coach posts. Two submit buttons
// (Save draft / Publish) map to two different server actions on the same form.
import { MentionHint } from "@/components/mention-hint";
import type { Post } from "@/lib/types";

export async function PostForm({
  saveDraft,
  publishPost,
  post,
  error,
}: {
  saveDraft: (formData: FormData) => void | Promise<void>;
  publishPost: (formData: FormData) => void | Promise<void>;
  post?: Post;
  error?: string;
}) {
  return (
    <form className="flex flex-col gap-5">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium">
          Title <span className="font-normal text-zinc-500">(optional)</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={post?.title ?? ""}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="body" className="text-sm font-medium">
          Post
        </label>
        <textarea
          id="body"
          name="body"
          rows={8}
          required
          defaultValue={post?.body ?? ""}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
        />
        <MentionHint />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          formAction={saveDraft}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Save draft
        </button>
        <button
          type="submit"
          formAction={publishPost}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {post?.status === "published" ? "Save & re-publish" : "Publish"}
        </button>
      </div>
    </form>
  );
}
