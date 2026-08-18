// components/mention-hint.tsx — lists approved participants' @handles beneath a composer so
// people know who they can @mention. There's no live autocomplete yet (that needs a client-
// side widget); this is a lightweight, server-rendered stand-in for now.
import { createClient } from "@/lib/supabase/server";

export async function MentionHint({ excludeUserId }: { excludeUserId?: string }) {
  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("handle")
    .eq("status", "approved")
    .order("handle", { ascending: true })
    .limit(30);
  if (excludeUserId) {
    query = query.neq("id", excludeUserId);
  }
  const { data } = await query;
  const handles = (data ?? []) as { handle: string }[];

  if (handles.length === 0) return null;

  return (
    <p className="text-xs text-zinc-500">
      Mention someone with @handle:{" "}
      {handles.map((p, i) => (
        <span key={p.handle}>
          <span className="font-medium text-zinc-600 dark:text-zinc-400">
            @{p.handle}
          </span>
          {i < handles.length - 1 ? ", " : ""}
        </span>
      ))}
    </p>
  );
}
