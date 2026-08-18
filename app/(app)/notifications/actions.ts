// app/(app)/notifications/actions.ts — mark all of the current user's notifications read.
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function markAllRead() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("recipient_id", user.id)
    .eq("read", false);

  revalidatePath("/notifications");
}
