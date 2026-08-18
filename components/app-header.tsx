// components/app-header.tsx — slim top bar showing the coachIke wordmark and a notification
// bell (with unread count) on signed-in screens.
import Link from "next/link";

export function AppHeader({ unreadCount = 0 }: { unreadCount?: number }) {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex max-w-md items-center gap-2 px-5 py-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900 text-[10px] font-bold tracking-wide text-white dark:bg-zinc-100 dark:text-zinc-900">
          IKE
        </span>
        <span className="text-sm font-semibold tracking-tight">
          coach<span className="font-extrabold">Ike</span>
        </span>

        <Link
          href="/notifications"
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
          className="relative ml-auto flex h-8 w-8 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z" />
            <path d="M10 19a2 2 0 0 0 4 0" />
          </svg>
          {unreadCount > 0 ? (
            <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Link>
      </div>
    </header>
  );
}
