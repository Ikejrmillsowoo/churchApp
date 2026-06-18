// app/(app)/admin/events/actions.ts — admin create/update/delete actions for events.
// Guarded by isAdmin() in addition to RLS (which restricts writes to admins).
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { datetimeLocalToISO } from "@/lib/datetime";
import { createClient } from "@/lib/supabase/server";

type EventFields = {
  title: string;
  location: string | null;
  description: string | null;
  starts_at: string | null;
  ends_at: string | null;
};

function readFields(formData: FormData): EventFields {
  return {
    title: String(formData.get("title") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    starts_at: datetimeLocalToISO(String(formData.get("starts_at") ?? "")),
    ends_at: datetimeLocalToISO(String(formData.get("ends_at") ?? "")),
  };
}

export async function createEvent(formData: FormData) {
  if (!(await isAdmin())) redirect("/");
  const fields = readFields(formData);
  if (!fields.title || !fields.starts_at) {
    redirect("/admin/events/new?error=Title+and+start+time+are+required");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("events")
    .insert({ ...fields, created_by: user?.id ?? null });
  if (error) {
    redirect(`/admin/events/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/events");
  revalidatePath("/calendar");
  redirect("/admin/events");
}

export async function updateEvent(formData: FormData) {
  if (!(await isAdmin())) redirect("/");
  const id = String(formData.get("id") ?? "");
  const fields = readFields(formData);
  if (!id || !fields.title || !fields.starts_at) {
    redirect(`/admin/events/${id}/edit?error=Title+and+start+time+are+required`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("events").update(fields).eq("id", id);
  if (error) {
    redirect(
      `/admin/events/${id}/edit?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/admin/events");
  revalidatePath("/calendar");
  redirect("/admin/events");
}

export async function deleteEvent(formData: FormData) {
  if (!(await isAdmin())) redirect("/");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("events").delete().eq("id", id);

  revalidatePath("/admin/events");
  revalidatePath("/calendar");
}
