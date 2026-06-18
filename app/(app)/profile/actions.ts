// app/(app)/profile/actions.ts — server action for a member to update their own profile
// (name, phone, and opt-in contact sharing). RLS limits the update to the caller's row.
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName || null,
      phone: phone || null,
      share_email: formData.get("share_email") === "on",
      share_phone: formData.get("share_phone") === "on",
    })
    .eq("id", user.id);

  if (error) {
    redirect(`/profile?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/profile");
  revalidatePath("/directory");
  redirect("/profile?saved=1");
}
