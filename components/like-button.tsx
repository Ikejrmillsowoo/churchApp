// components/like-button.tsx — a small like/unlike toggle backed by a server action form.
import { likePost, unlikePost } from "@/app/(app)/feed/actions";

export function LikeButton({
  postId,
  liked,
  count,
}: {
  postId: string;
  liked: boolean;
  count: number;
}) {
  return (
    <form>
      <input type="hidden" name="post_id" value={postId} />
      <button
        type="submit"
        formAction={liked ? unlikePost : likePost}
        aria-pressed={liked}
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
          liked
            ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
            : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        }`}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M12 20.5 4.5 13a4.8 4.8 0 0 1 0-6.8 4.7 4.7 0 0 1 6.7 0l.8.8.8-.8a4.7 4.7 0 0 1 6.7 0 4.8 4.8 0 0 1 0 6.8Z" />
        </svg>
        {liked ? "Liked" : "Like"}
        {count > 0 ? <span className="tabular-nums">· {count}</span> : null}
      </button>
    </form>
  );
}
