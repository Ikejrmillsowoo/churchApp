// app/(app)/calendar/page.tsx — upcoming events for approved members, each with an
// "Add to calendar" link that downloads an .ics file. RLS limits reads to approved members
// and admins; others see a notice.
import { redirect } from "next/navigation";
import { PlaceholderScreen } from "@/components/placeholder-screen";
import { getProfile } from "@/lib/auth";
import { formatEventDate } from "@/lib/datetime";
import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/lib/types";

export default async function CalendarPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const canView = profile.status === "approved" || profile.role === "admin";
  if (!canView) {
    return (
      <PlaceholderScreen
        title="Calendar"
        description="Church events appear here once an admin approves your membership."
      />
    );
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true });
  const events = (data ?? []) as Event[];

  return (
    <main className="flex flex-1 flex-col gap-4 px-5 py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Upcoming church events
        </p>
      </header>

      {events.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
          No upcoming events.
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
                  {event.ends_at
                    ? ` – ${formatEventDate(event.ends_at)}`
                    : ""}
                </p>
                {event.location ? (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {event.location}
                  </p>
                ) : null}
              </div>
              {event.description ? (
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  {event.description}
                </p>
              ) : null}
              <a
                href={`/calendar/${event.id}/ics`}
                className="self-start rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Add to my calendar
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
