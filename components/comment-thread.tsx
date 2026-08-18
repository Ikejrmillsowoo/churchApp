// components/comment-thread.tsx — flat (non-threaded) comment list with a composer.
// Each comment offers edit/delete to its author (or admin), and hide/unhide to admins only,
// driven entirely by server action forms and an ?edit= query param for the edit state.
import Link from "next/link";
import {
  addComment,
  deleteComment,
  hideComment,
  unhideComment,
  updateComment,
} from "@/app/(app)/feed/actions";
import { formatEventDate } from "@/lib/datetime";
import type { CommentWithAuthor } from "@/lib/types";
import { MentionHint } from "@/components/mention-hint";
import { MentionText } from "@/components/mention-text";

export async function CommentThread({
  postId,
  comments,
  currentUserId,
  isAdmin,
  editingId,
}: {
  postId: string;
  comments: CommentWithAuthor[];
  currentUserId: string;
  isAdmin: boolean;
  editingId?: string;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        Comments {comments.length > 0 ? `(${comments.length})` : ""}
      </h2>

      <form action={addComment} className="flex flex-col gap-2">
        <input type="hidden" name="post_id" value={postId} />
        <textarea
          name="body"
          rows={3}
          required
          placeholder="Add a comment…"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
        />
        <MentionHint excludeUserId={currentUserId} />
        <button
          type="submit"
          className="self-start rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Comment
        </button>
      </form>

      {comments.length === 0 ? (
        <p className="text-sm text-zinc-500">No comments yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {comments.map((comment) => {
            const canManage = comment.author_id === currentUserId || isAdmin;
            const isEditing = editingId === comment.id;

            return (
              <li
                key={comment.id}
                className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-medium">
                    {comment.authorName}
                    {comment.hidden ? (
                      <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                        Hidden
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatEventDate(comment.created_at)}
                  </p>
                </div>

                {isEditing ? (
                  <form
                    action={updateComment}
                    className="mt-2 flex flex-col gap-2"
                  >
                    <input type="hidden" name="id" value={comment.id} />
                    <input type="hidden" name="post_id" value={postId} />
                    <textarea
                      name="body"
                      rows={3}
                      required
                      defaultValue={comment.body}
                      className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="rounded-md bg-zinc-900 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                      >
                        Save
                      </button>
                      <Link
                        href={`/feed/${postId}`}
                        className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                      >
                        Cancel
                      </Link>
                    </div>
                  </form>
                ) : (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200">
                    <MentionText text={comment.body} />
                  </p>
                )}

                {!isEditing && canManage ? (
                  <div className="mt-2 flex flex-wrap gap-3 text-xs">
                    {canManage ? (
                      <Link
                        href={`/feed/${postId}?edit=${comment.id}`}
                        className="font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                      >
                        Edit
                      </Link>
                    ) : null}
                    {canManage ? (
                      <form action={deleteComment}>
                        <input type="hidden" name="id" value={comment.id} />
                        <input type="hidden" name="post_id" value={postId} />
                        <button
                          type="submit"
                          className="font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </form>
                    ) : null}
                    {isAdmin ? (
                      <form
                        action={comment.hidden ? unhideComment : hideComment}
                      >
                        <input type="hidden" name="id" value={comment.id} />
                        <input type="hidden" name="post_id" value={postId} />
                        <button
                          type="submit"
                          className="font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                        >
                          {comment.hidden ? "Unhide" : "Hide"}
                        </button>
                      </form>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
