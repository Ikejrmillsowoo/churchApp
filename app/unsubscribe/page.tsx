// app/unsubscribe/page.tsx — public page reached from the unsubscribe link in emails.
// Shows a confirm button (so email-client link prefetching can't auto-unsubscribe) and a
// success state. Lives outside the (app) shell and is allowed for logged-out visitors.
import { unsubscribe } from "@/app/unsubscribe/actions";

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; done?: string }>;
}) {
  const { token, done } = await searchParams;

  if (done) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Unsubscribed</h1>
        <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
          You won&apos;t receive church emails anymore. You can re-enable them
          anytime from your profile.
        </p>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Invalid unsubscribe link
        </h1>
        <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
          This link is missing its token. Please use the unsubscribe link from a
          recent email.
        </p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Unsubscribe from emails?
      </h1>
      <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
        You&apos;ll stop receiving church announcement emails.
      </p>
      <form action={unsubscribe}>
        <input type="hidden" name="token" value={token} />
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Unsubscribe
        </button>
      </form>
    </main>
  );
}
