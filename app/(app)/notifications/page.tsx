// app/(app)/notifications/page.tsx — the current user's @mention notifications, newest
// first, with a "Mark all as read" action. Each notification links to the post it's about.
import Link from "next/link";
import { redirect } from "next/navigation";
import { markAllRead } from "@/app/(app)/notifications/actions";
import { getCurrentUser } from "@/lib/auth";
import { formatEventDate } from "@/lib/datetime";
import { createClient } from "@/lib/supabase/server";
import type { Notification } from "@/lib/types";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  const notifications = (data ?? []) as Notification[];

  const postIds = [...new Set(notifications.map((n) => n.post_id).filter(Boolean))];
  const actorIds = [...new Set(notifications.map((n) => n.actor_id))];

  const [{ data: posts }, { data: actors }] = await Promise.all([
    postIds.length > 0
      ? supabase.from("posts").select("id, title").in("id", postIds as string[])
      : Promise.resolve({ data: [] as { id: string; title: string | null }[] }),
    actorIds.length > 0
      ? supabase.from("profiles").select("id, full_name").in("id", actorIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string | null }[] }),
  ]);

  const postTitleById = new Map((posts ?? []).map((p) => [p.id, p.title]));
  const actorNameById = new Map(
    (actors ?? []).map((a) => [a.id, a.full_name ?? "Someone"]),
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <main className="flex flex-1 flex-col gap-4 px-5 py-8">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Notifications
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 ? (
          <form action={markAllRead}>
            <button
              type="submit"
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Mark all as read
            </button>
          </form>
        ) : null}
      </header>

      {notifications.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
          No notifications yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {notifications.map((n) => {
            const postTitle = n.post_id
              ? postTitleById.get(n.post_id) ?? "a post"
              : "a post";
            const actorName = actorNameById.get(n.actor_id) ?? "Someone";

            const content = (
              <>
                <span className="font-medium">{actorName}</span> mentioned you
                {n.comment_id ? " in a comment on " : " in "}
                <span className="font-medium">
                  &ldquo;{postTitle}&rdquo;
                </span>
              </>
            );

            return (
              <li key={n.id}>
                {n.post_id ? (
                  <Link
                    href={`/feed/${n.post_id}`}
                    className={`flex items-start justify-between gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
                      n.read
                        ? "border-zinc-200 dark:border-zinc-800"
                        : "border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/60"
                    }`}
                  >
                    <span>{content}</span>
                    <span className="shrink-0 text-xs text-zinc-500">
                      {formatEventDate(n.created_at)}
                    </span>
                  </Link>
                ) : (
                  <div className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                    <span>{content}</span>
                    <span className="shrink-0 text-xs text-zinc-500">
                      {formatEventDate(n.created_at)}
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
