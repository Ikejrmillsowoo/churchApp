// app/(app)/admin/posts/page.tsx — admin list of all posts (draft + published) with pin,
// edit, publish/unpublish, and delete. Admin access is enforced by the admin layout + RLS.
import Link from "next/link";
import {
  deletePost,
  setPostPinned,
  unpublishPost,
} from "@/app/(app)/admin/posts/actions";
import { formatEventDate } from "@/lib/datetime";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";

export default async function AdminPostsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });
  const posts = (data ?? []) as Post[];

  return (
    <main className="flex flex-1 flex-col gap-4 px-5 py-8">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {posts.length} total
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          New post
        </Link>
      </header>

      {posts.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
          No posts yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{post.title ?? "Untitled post"}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {post.status === "published"
                      ? `Published ${formatEventDate(post.published_at ?? post.created_at)}`
                      : "Draft"}
                    {post.pinned ? " · Pinned" : ""}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    post.status === "published"
                      ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  {post.status === "published" ? "Published" : "Draft"}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/posts/${post.id}/edit`}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                >
                  Edit
                </Link>

                <form>
                  <input type="hidden" name="id" value={post.id} />
                  <input
                    type="hidden"
                    name="pinned"
                    value={(!post.pinned).toString()}
                  />
                  <button
                    type="submit"
                    formAction={setPostPinned}
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                  >
                    {post.pinned ? "Unpin" : "Pin"}
                  </button>
                </form>

                {post.status === "published" ? (
                  <form>
                    <input type="hidden" name="id" value={post.id} />
                    <button
                      type="submit"
                      formAction={unpublishPost}
                      className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                    >
                      Unpublish
                    </button>
                  </form>
                ) : null}

                <form>
                  <input type="hidden" name="id" value={post.id} />
                  <button
                    type="submit"
                    formAction={deletePost}
                    className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
