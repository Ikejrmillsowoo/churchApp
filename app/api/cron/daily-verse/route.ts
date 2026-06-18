// app/api/cron/daily-verse/route.ts — Vercel Cron endpoint. Once a day it fetches the day's
// curated verse from bible-api.com and caches it in daily_verse using the service role key
// (which bypasses RLS). Protected by the CRON_SECRET bearer token that Vercel Cron sends.
import { createAdminClient } from "@/lib/supabase/admin";
import { getReferenceForDate } from "@/lib/verses";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  const supabase = createAdminClient();

  // Idempotent: don't refetch if we already cached today's verse.
  const { data: existing } = await supabase
    .from("daily_verse")
    .select("id")
    .eq("verse_date", today)
    .maybeSingle();
  if (existing) {
    return Response.json({ status: "exists", date: today });
  }

  const reference = getReferenceForDate(new Date());
  const res = await fetch(
    `https://bible-api.com/${encodeURIComponent(reference)}`,
    { cache: "no-store" },
  );
  if (!res.ok) {
    return new Response("Failed to fetch verse", { status: 502 });
  }

  const verse = (await res.json()) as { reference?: string; text?: string };
  const text = (verse.text ?? "").trim();
  if (!text) {
    return new Response("Empty verse response", { status: 502 });
  }

  const { error } = await supabase
    .from("daily_verse")
    .upsert(
      { verse_date: today, reference: verse.reference ?? reference, text },
      { onConflict: "verse_date" },
    );
  if (error) {
    return new Response(error.message, { status: 500 });
  }

  return Response.json({
    status: "created",
    date: today,
    reference: verse.reference ?? reference,
  });
}
