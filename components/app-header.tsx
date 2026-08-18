// components/app-header.tsx — slim top bar showing the coachIke wordmark on signed-in screens.
export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex max-w-md items-center gap-2 px-5 py-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900 text-[10px] font-bold tracking-wide text-white dark:bg-zinc-100 dark:text-zinc-900">
          IKE
        </span>
        <span className="text-sm font-semibold tracking-tight">
          coach<span className="font-extrabold">Ike</span>
        </span>
      </div>
    </header>
  );
}
