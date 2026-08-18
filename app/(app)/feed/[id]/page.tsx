// app/(app)/feed/[id]/page.tsx — full post detail view for participants.
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PlaceholderScreen } from "@/components/placeholder-screen";
import { getProfile } from "@/lib/auth";
import { formatEventDate } from "@/lib/datetime";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
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
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .single<Post>();
  if (!data) notFound();

  return (
    <main className="flex flex-1 flex-col gap-4 px-5 py-8">
      <Link
        href="/feed"
        className="text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        ← Back to feed
      </Link>

      <article className="flex flex-col gap-3">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">
            {data.title ?? "Untitled post"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {formatEventDate(data.published_at ?? data.created_at)}
          </p>
        </header>
        <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-200">
          {data.body}
        </div>
      </article>
    </main>
  );
}
