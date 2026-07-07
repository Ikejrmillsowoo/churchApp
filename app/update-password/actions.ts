// app/update-password/actions.ts — sets a new password for the currently authenticated user
// (reached after the recovery link signs them in).
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 6) {
    redirect(
      "/update-password?error=" +
        encodeURIComponent("Password must be at least 6 characters."),
    );
  }
  if (password !== confirm) {
    redirect(
      "/update-password?error=" +
        encodeURIComponent("Passwords do not match."),
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(
      "/login?error=" +
        encodeURIComponent(
          "Your reset link has expired. Please request a new one.",
        ),
    );
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect(`/update-password?error=${encodeURIComponent(error.message)}`);
  }

  // Sign out so the user re-authenticates with the new password.
  await supabase.auth.signOut();
  redirect(
    "/login?message=" +
      encodeURIComponent("Password updated. Please sign in."),
  );
}
