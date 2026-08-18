// components/mention-text.tsx — renders body text with @handle mentions visually
// highlighted and linked to the directory (there's no individual profile page yet).
import Link from "next/link";
import { Fragment } from "react";

const MENTION_PATTERN = /@([a-z0-9]+)/gi;

export function MentionText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(MENTION_PATTERN)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      parts.push(
        <Fragment key={key++}>{text.slice(lastIndex, start)}</Fragment>,
      );
    }
    parts.push(
      <Link
        key={key++}
        href="/directory"
        className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 dark:text-zinc-100 dark:decoration-zinc-600"
      >
        @{match[1]}
      </Link>,
    );
    lastIndex = start + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(<Fragment key={key++}>{text.slice(lastIndex)}</Fragment>);
  }

  return <>{parts}</>;
}
