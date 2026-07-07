// app/forgot-password/page.tsx — request a password reset email. Public route.
import Link from "next/link";
import { requestPasswordReset } from "@/app/forgot-password/actions";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight">
          Reset password
        </h1>
        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
          Enter your email and we&apos;ll send you a link to set a new password.
        </p>

        {sent ? (
          <p className="mb-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
            If an account exists for that email, a reset link is on its way.
            Check your inbox.
          </p>
        ) : (
          <form action={requestPasswordReset} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
            <button
              type="submit"
              className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Send reset link
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/login" className="font-medium underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
