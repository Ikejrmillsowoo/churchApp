// app/forgot-password/actions.ts — sends a password reset email via Supabase Auth.
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();

  if (email) {
    const supabase = await createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/update-password`,
    });
  }

  // Always show the same result, so we don't reveal whether an account exists.
  redirect("/forgot-password?sent=1");
}
