// app/(app)/admin/page.tsx — admin hub linking to admin tools. Access is gated by the admin
// layout. Shows a live count of members awaiting approval.
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  const pendingCount = count ?? 0;

  return (
    <main className="flex flex-1 flex-col gap-4 px-5 py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Manage members and church content.
        </p>
      </header>

      <Link
        href="/admin/approvals"
        className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
      >
        <div>
          <p className="font-medium">Member approvals</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Review and approve new members
          </p>
        </div>
        {pendingCount > 0 ? (
          <span className="rounded-full bg-zinc-900 px-2.5 py-0.5 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
            {pendingCount}
          </span>
        ) : null}
      </Link>

      <div className="rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700">
        Event editor and message composer arrive in later phases.
      </div>
    </main>
  );
}
