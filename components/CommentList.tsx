"use client";

import { useMemo } from "react";
import { MessageSquareReply } from "lucide-react";
import { ReportButton } from "@/components/ReportButton";
import { buildAnonymousNameMap } from "@/lib/anonymousNames";
import type { CommentWithReply } from "@/lib/types";

const formatter = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
});

export function CommentList({
  comments,
  postAuthorId,
  onReply
}: {
  comments: CommentWithReply[];
  postAuthorId: string;
  onReply: (comment: CommentWithReply) => void;
}) {
  const namesByUserId = useMemo(
    () => buildAnonymousNameMap(comments, postAuthorId),
    [comments, postAuthorId]
  );
  const commentsById = useMemo(() => new Map(comments.map((comment) => [comment.id, comment])), [comments]);

  return (
    <div className="space-y-3">
      {comments.map((comment) => {
        const authorName = namesByUserId.get(comment.user_id) ?? "Anonymous";
        const repliedComment = comment.reply_to_comment_id ? commentsById.get(comment.reply_to_comment_id) : null;
        const repliedAuthorName = repliedComment ? namesByUserId.get(repliedComment.user_id) : null;

        return (
          <article key={comment.id} className="rounded-md border border-ink/10 bg-panel/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-mist px-2 py-1 text-xs font-semibold text-moss">{authorName}</span>
                <span className="rounded-md bg-mist px-2 py-1 text-xs font-semibold text-moss">#R{comment.public_no}</span>
                {comment.reply_to_public_no ? (
                  <span className="rounded-md bg-clay/10 px-2 py-1 text-xs font-medium text-clay">
                    回复 {repliedAuthorName ? `${repliedAuthorName} ` : ""}#R{comment.reply_to_public_no}
                  </span>
                ) : null}
              </div>
              <span className="text-xs text-ink/45">{formatter.format(new Date(comment.created_at))}</span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink">{comment.content}</p>
            <div className="mt-3 flex flex-wrap items-start justify-between gap-2 border-t border-ink/10 pt-3">
              <button
                type="button"
                onClick={() => onReply(comment)}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-ink/55 hover:bg-mist hover:text-ink"
              >
                <MessageSquareReply size={14} aria-hidden="true" />
                回复
              </button>
              <ReportButton targetType="comment" targetId={comment.id} />
            </div>
          </article>
        );
      })}
    </div>
  );
}
