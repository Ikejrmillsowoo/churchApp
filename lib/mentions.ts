// lib/mentions.ts — extract @handle mentions from post/comment text.
// Handles are lowercase alphanumeric (see generate_unique_handle in migration 0010).

const MENTION_PATTERN = /@([a-z0-9]+)/gi;

// Returns the distinct, lowercased handles mentioned in `body`.
export function extractMentionedHandles(body: string): string[] {
  const handles = new Set<string>();
  for (const match of body.matchAll(MENTION_PATTERN)) {
    handles.add(match[1].toLowerCase());
  }
  return [...handles];
}
