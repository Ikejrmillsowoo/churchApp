// components/placeholder-screen.tsx — simple "coming soon" screen used by nav destinations
// whose features arrive in later phases.
export function PlaceholderScreen({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
      <span className="mt-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        Coming soon
      </span>
    </main>
  );
}
