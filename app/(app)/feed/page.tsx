// app/(app)/feed/page.tsx — the participant reading feed: published posts from the coach,
// pinned posts first. RLS limits reads to approved participants and admins.
import Link from "next/link";
import { redirect } from "next/navigation";
import { PlaceholderScreen } from "@/components/placeholder-screen";
import { getProfile } from "@/lib/auth";
import { formatEventDate } from "@/lib/datetime";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";

function excerpt(body: string, max = 220): string {
  if (body.length <= max) return body;
  return `${body.slice(0, max).trimEnd()}…`;
}

export default async function FeedPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const canView = profile.status === "approved" || profile.role === "admin";
  if (!canView) {
    return (
      <PlaceholderScreen
        title="Feed"
        description="Posts from your coach appear here once an admin approves your account."
      />
    );
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("pinned", { ascending: false })
    .order("published_at", { ascending: false });
  const posts = (data ?? []) as Post[];

  return (
    <main className="flex flex-1 flex-col gap-4 px-5 py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Feed</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Posts and updates from your coach
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
          Nothing posted yet. Check back soon.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/feed/${post.id}`}
                className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">
                    {post.title ?? "Untitled post"}
                  </p>
                  {post.pinned ? (
                    <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      Pinned
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  {excerpt(post.body)}
                </p>
                <p className="text-xs text-zinc-500">
                  {formatEventDate(post.published_at ?? post.created_at)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
