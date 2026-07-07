// app/unsubscribe/actions.ts — turns off a member's email opt-in via their unsubscribe token.
// Runs without a session (links are clicked from email), so it uses the service-role client.
"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export async function unsubscribe(formData: FormData) {
  const token = String(formData.get("token") ?? "").trim();
  if (token) {
    const admin = createAdminClient();
    await admin
      .from("profiles")
      .update({ email_opt_in: false })
      .eq("unsubscribe_token", token);
  }
  redirect("/unsubscribe?done=1");
}
