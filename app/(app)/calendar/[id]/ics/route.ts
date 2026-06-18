// app/(app)/calendar/[id]/ics/route.ts — returns a downloadable .ics file for one event.
// The request runs as the signed-in user, so RLS ensures only approved members/admins can
// fetch the event.
import { buildEventICS } from "@/lib/ics";
import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single<Event>();

  if (!data) {
    return new Response("Not found", { status: 404 });
  }

  const filename = `${(data.title || "event")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}.ics`;

  return new Response(buildEventICS(data), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
