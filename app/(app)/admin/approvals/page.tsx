// app/(app)/admin/approvals/page.tsx — admin screen listing members awaiting approval,
// each with approve/reject actions. Admin access is enforced by the admin layout + RLS.
import { approveMember, rejectMember } from "@/app/(app)/admin/actions";
import { createClient } from "@/lib/supabase/server";
import type { PendingMember } from "@/lib/types";

export default async function ApprovalsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  const pending = (data ?? []) as PendingMember[];

  return (
    <main className="flex flex-1 flex-col gap-4 px-5 py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Pending members
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {pending.length} awaiting review
        </p>
      </header>

      {pending.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
          No pending members right now.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {pending.map((member) => (
            <li
              key={member.id}
              className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div>
                <p className="font-medium">{member.full_name ?? "Member"}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {member.email ?? "no email"}
                  {member.phone ? ` · ${member.phone}` : ""}
                </p>
              </div>
              <form className="flex gap-2">
                <input type="hidden" name="id" value={member.id} />
                <button
                  type="submit"
                  formAction={approveMember}
                  className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  type="submit"
                  formAction={rejectMember}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                >
                  Reject
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
