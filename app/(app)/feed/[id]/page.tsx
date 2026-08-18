// app/(app)/feed/[id]/page.tsx — full post detail view: the post, a like button, and a
// flat comment thread with add/edit/delete and admin moderation.
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CommentThread } from "@/components/comment-thread";
import { LikeButton } from "@/components/like-button";
import { PlaceholderScreen } from "@/components/placeholder-screen";
import { getCurrentUser, getProfile } from "@/lib/auth";
import { formatEventDate } from "@/lib/datetime";
import { createClient } from "@/lib/supabase/server";
import type { Comment, CommentWithAuthor, Post } from "@/lib/types";

export default async function PostDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
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

  const { id } = await params;
  const { edit } = await searchParams;
  const supabase = await createClient();
  const user = await getCurrentUser();

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .single<Post>();
  if (!post) notFound();

  const [{ count: likeCount }, { data: ownLike }, { data: commentRows }] =
    await Promise.all([
      supabase
        .from("post_likes")
        .select("post_id", { count: "exact", head: true })
        .eq("post_id", id),
      user
        ? supabase
            .from("post_likes")
            .select("post_id")
            .eq("post_id", id)
            .eq("user_id", user.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("comments")
        .select("*")
        .eq("post_id", id)
        .order("created_at", { ascending: true }),
    ]);

  const comments = (commentRows ?? []) as Comment[];
  const authorIds = [...new Set(comments.map((c) => c.author_id).filter(Boolean))];
  const { data: authorProfiles } =
    authorIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", authorIds as string[])
      : { data: [] as { id: string; full_name: string | null }[] };

  const nameById = new Map(
    (authorProfiles ?? []).map((p) => [p.id, p.full_name ?? "Participant"]),
  );
  const commentsWithAuthor: CommentWithAuthor[] = comments.map((c) => ({
    ...c,
    authorName: c.author_id ? nameById.get(c.author_id) ?? "Participant" : "Participant",
  }));

  return (
    <main className="flex flex-1 flex-col gap-6 px-5 py-8">
      <Link
        href="/feed"
        className="text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        ← Back to feed
      </Link>

      <article className="flex flex-col gap-3">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">
            {post.title ?? "Untitled post"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {formatEventDate(post.published_at ?? post.created_at)}
          </p>
        </header>
        <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-200">
          {post.body}
        </div>
        <div className="pt-1">
          <LikeButton
            postId={post.id}
            liked={Boolean(ownLike)}
            count={likeCount ?? 0}
          />
        </div>
      </article>

      <hr className="border-zinc-200 dark:border-zinc-800" />

      {user ? (
        <CommentThread
          postId={post.id}
          comments={commentsWithAuthor}
          currentUserId={user.id}
          isAdmin={profile.role === "admin"}
          editingId={edit}
        />
      ) : null}
    </main>
  );
}
