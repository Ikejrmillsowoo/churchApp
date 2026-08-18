// app/(app)/directory/page.tsx — directory of approved participants. Reads the masking view
// so each participant's email/phone appears only if they opted to share it. Non-approved
// participants see a notice instead, and RLS prevents reading the directory until approved.
import { redirect } from "next/navigation";
import { PlaceholderScreen } from "@/components/placeholder-screen";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { DirectoryMember } from "@/lib/types";

export default async function DirectoryPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  if (profile.status !== "approved") {
    return (
      <PlaceholderScreen
        title="Directory"
        description="The directory unlocks once an admin approves your account."
      />
    );
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("member_directory")
    .select("id, full_name, email, phone");
  const members = (data ?? []) as DirectoryMember[];

  return (
    <main className="flex flex-1 flex-col gap-4 px-5 py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Directory</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {members.length} approved{" "}
          {members.length === 1 ? "participant" : "participants"}
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {members.map((member) => (
          <li
            key={member.id}
            className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <p className="font-medium">
              {member.full_name ?? "Participant"}
            </p>
            <div className="mt-1 flex flex-col gap-0.5 text-sm text-zinc-600 dark:text-zinc-400">
              {member.email ? (
                <a href={`mailto:${member.email}`} className="underline">
                  {member.email}
                </a>
              ) : null}
              {member.phone ? (
                <a href={`tel:${member.phone}`} className="underline">
                  {member.phone}
                </a>
              ) : null}
              {!member.email && !member.phone ? (
                <span className="text-zinc-400 dark:text-zinc-500">
                  No shared contact info
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
