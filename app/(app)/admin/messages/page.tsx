// app/(app)/admin/messages/page.tsx — admin compose screen for mass emails plus a history of
// past sends. Admin access is enforced by the admin layout + RLS.
import { sendMessage } from "@/app/(app)/admin/messages/actions";
import { formatEventDate } from "@/lib/datetime";
import { createClient } from "@/lib/supabase/server";
import type { Message } from "@/lib/types";

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);
  const history = (data ?? []) as Message[];

  return (
    <main className="flex flex-1 flex-col gap-6 px-5 py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Email opted-in members. Each email includes an unsubscribe link.
        </p>
      </header>

      {sent ? (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
          Message sent to {sent} {sent === "1" ? "member" : "members"}.
        </p>
      ) : null}
      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <form action={sendMessage} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label htmlFor="audience" className="text-sm font-medium">
            Audience
          </label>
          <select
            id="audience"
            name="audience"
            defaultValue="approved"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="approved">Approved members</option>
            <option value="pending">Pending members</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="subject" className="text-sm font-medium">
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            required
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="body" className="text-sm font-medium">
            Message
          </label>
          <textarea
            id="body"
            name="body"
            rows={8}
            required
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        <button
          type="submit"
          className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Send message
        </button>
      </form>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Recent sends</h2>
        {history.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
            No messages sent yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {history.map((message) => (
              <li
                key={message.id}
                className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <p className="font-medium">{message.subject}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {message.audience} · {message.recipient_count} sent ·{" "}
                  {formatEventDate(message.created_at)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
