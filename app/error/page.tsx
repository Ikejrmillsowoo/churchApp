// app/error/page.tsx — generic auth error landing (e.g. an expired confirmation link).
import Link from "next/link";

export default function ErrorPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Something went wrong
      </h1>
      <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-400">
        That link may have expired or already been used. Please try signing in
        again.
      </p>
      <Link href="/login" className="text-sm font-medium underline">
        Back to sign in
      </Link>
    </main>
  );
}
