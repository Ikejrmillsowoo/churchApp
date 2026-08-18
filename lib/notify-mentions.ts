// lib/notify-mentions.ts — creates a notification for each approved participant @mentioned
// in a post or comment body. Called from the authenticated user's own Supabase client, so
// RLS (0010_mentions_notifications.sql) is the real gate on who can notify whom.
import type { SupabaseClient } from "@supabase/supabase-js";
import { extractMentionedHandles } from "@/lib/mentions";

export async function notifyMentions(
  supabase: SupabaseClient,
  actorId: string,
  body: string,
  target: { postId: string; commentId?: string },
) {
  const handles = extractMentionedHandles(body);
  if (handles.length === 0) return;

  const { data: mentioned } = await supabase
    .from("profiles")
    .select("id")
    .in("handle", handles)
    .neq("id", actorId);

  const recipientIds = (mentioned ?? []).map((p: { id: string }) => p.id);
  if (recipientIds.length === 0) return;

  await supabase.from("notifications").insert(
    recipientIds.map((recipientId) => ({
      recipient_id: recipientId,
      actor_id: actorId,
      type: "mention" as const,
      post_id: target.postId,
      comment_id: target.commentId ?? null,
    })),
  );
}
