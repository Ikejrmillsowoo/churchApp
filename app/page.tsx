// app/page.tsx — authenticated home screen. Greets the member and shows their approval
// status. Route protection is enforced by middleware; this is a defensive fallback.
import { redirect } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { getProfile } from "@/lib/auth";

const STATUS_MESSAGE: Record<string, string> = {
  pending: "Your membership is awaiting admin approval.",
  approved: "You're an approved member.",
  rejected: "Your membership request was not approved.",
};

export default async function Home() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Welcome{profile.full_name ? `, ${profile.full_name}` : ""}
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
          {STATUS_MESSAGE[profile.status] ?? "Welcome to the Church App."}
        </p>
      </div>

      <form action={signOut}>
        <button
          type="submit"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
