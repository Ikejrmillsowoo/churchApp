// app/(app)/admin/actions.ts — admin actions to approve or reject pending members.
// Guarded by isAdmin() in addition to RLS (which already restricts these updates to admins).
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import type { MemberStatus } from "@/lib/types";

async function setMemberStatus(id: string, status: MemberStatus) {
  if (!id || !(await isAdmin())) return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ status }).eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/admin/approvals");
  revalidatePath("/directory");
}

export async function approveMember(formData: FormData) {
  await setMemberStatus(String(formData.get("id") ?? ""), "approved");
}

export async function rejectMember(formData: FormData) {
  await setMemberStatus(String(formData.get("id") ?? ""), "rejected");
}
