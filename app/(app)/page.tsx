// app/(app)/page.tsx — authenticated home screen. Shows the scripture of the day (cached in
// daily_verse), greets the member, and shows their approval status with a sign-out button.
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { DailyVerse } from "@/lib/types";

const STATUS_MESSAGE: Record<string, string> = {
  pending: "Your membership is awaiting admin approval.",
  approved: "You're an approved member.",
  rejected: "Your membership request was not approved.",
};

export default async function Home() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const { data: verse } = await supabase
    .from("daily_verse")
    .select("reference, text, verse_date")
    .order("verse_date", { ascending: false })
    .limit(1)
    .maybeSingle<Pick<DailyVerse, "reference" | "text" | "verse_date">>();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      {verse ? (
        <figure className="w-full max-w-md rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Verse of the day
          </p>
          <blockquote className="mt-2 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
            {verse.text}
          </blockquote>
          <figcaption className="mt-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
            {verse.reference}
          </figcaption>
        </figure>
      ) : null}

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Welcome{profile.full_name ? `, ${profile.full_name}` : ""}
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
          {STATUS_MESSAGE[profile.status] ?? "Welcome to the Church App."}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Edit profile
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
