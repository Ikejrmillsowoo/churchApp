// app/page.tsx — temporary home screen for Phase 0; replaced with real features in later phases.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Church App
      </h1>
      <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
        Welcome. This is the starting point for our church membership and
        engagement app. Features arrive phase by phase.
      </p>
    </main>
  );
}
