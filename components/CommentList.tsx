"use client";

import { MessageSquareReply } from "lucide-react";
import { DeleteButton } from "@/components/DeleteButton";
import { ReferenceText } from "@/components/ReferenceText";
import { ReportButton } from "@/components/ReportButton";
import type { CommentView } from "@/lib/types";

const formatter = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
});

export function CommentList({
  comments,
  onReply,
  onDeleted,
  currentPublicNo
}: {
  comments: CommentView[];
  onReply: (comment: CommentView) => void;
  onDeleted?: () => void;
  currentPublicNo: number;
}) {
  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <article id={`comment-${comment.id}`} key={comment.id} className="scroll-mt-20 rounded-md border border-ink/10 bg-panel/90 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-mist px-2 py-1 text-xs font-semibold text-moss">{comment.author_name}</span>
              <span className="rounded-md bg-mist px-2 py-1 text-xs font-semibold text-moss">#{comment.sequence}</span>
              {comment.status === "folded" ? (
                <span className="rounded-md bg-clay/10 px-2 py-1 text-xs font-medium text-clay">已折叠</span>
              ) : null}
              {comment.reply_to_sequence && comment.reply_to_comment_id ? (
                <a
                  href={`#comment-${comment.reply_to_comment_id}`}
                  className="rounded-md bg-clay/10 px-2 py-1 text-xs font-medium text-clay hover:bg-clay/15 hover:text-clay"
                >
                  回复 {comment.reply_to_author_name ? `${comment.reply_to_author_name} ` : ""}#{comment.reply_to_sequence}
                </a>
              ) : null}
            </div>
            <span className="text-xs text-ink/45">{formatter.format(new Date(comment.created_at))}</span>
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={() => onReply(comment)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onReply(comment);
              }
            }}
            className="mt-3 block w-full cursor-pointer text-left"
          >
            <ReferenceText
              content={comment.content}
              currentPublicNo={currentPublicNo}
              className="whitespace-pre-wrap text-base leading-7 text-ink"
              stopPropagation
            />
          </div>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-2 border-t border-ink/10 pt-3">
            <button
              type="button"
              onClick={() => onReply(comment)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-ink/55 hover:bg-mist hover:text-ink"
            >
              <MessageSquareReply size={14} aria-hidden="true" />
              回复
            </button>
            <div className="flex items-start gap-2">
              <DeleteButton targetType="comment" targetId={comment.id} authorId={comment.author_id} onDeleted={onDeleted} />
              <ReportButton targetType="comment" targetId={comment.id} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
