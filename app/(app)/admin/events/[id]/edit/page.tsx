// app/(app)/admin/events/[id]/edit/page.tsx — admin form to edit an existing event.
import { notFound } from "next/navigation";
import { updateEvent } from "@/app/(app)/admin/events/actions";
import { EventForm } from "@/components/event-form";
import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/lib/types";

export default async function EditEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single<Event>();
  if (!data) notFound();

  return (
    <main className="flex flex-1 flex-col gap-6 px-5 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Edit event</h1>
      <EventForm
        action={updateEvent}
        event={data}
        submitLabel="Save changes"
        error={error}
      />
    </main>
  );
}
