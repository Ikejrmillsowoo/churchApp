// app/(app)/admin/events/page.tsx — admin list of all events with create / edit / delete.
// Admin access is enforced by the admin layout + RLS.
import Link from "next/link";
import { deleteEvent } from "@/app/(app)/admin/events/actions";
import { formatEventDate } from "@/lib/datetime";
import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/lib/types";

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .order("starts_at", { ascending: true });
  const events = (data ?? []) as Event[];

  return (
    <main className="flex flex-1 flex-col gap-4 px-5 py-8">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {events.length} total
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          New event
        </Link>
      </header>

      {events.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
          No events yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {events.map((event) => (
            <li
              key={event.id}
              className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div>
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {formatEventDate(event.starts_at)}
                  {event.location ? ` · ${event.location}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/events/${event.id}/edit`}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                >
                  Edit
                </Link>
                <form action={deleteEvent}>
                  <input type="hidden" name="id" value={event.id} />
                  <button
                    type="submit"
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
