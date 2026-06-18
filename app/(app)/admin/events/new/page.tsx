// app/(app)/admin/events/new/page.tsx — admin form to create an event.
import { createEvent } from "@/app/(app)/admin/events/actions";
import { EventForm } from "@/components/event-form";

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex flex-1 flex-col gap-6 px-5 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">New event</h1>
      <EventForm action={createEvent} submitLabel="Create event" error={error} />
    </main>
  );
}
