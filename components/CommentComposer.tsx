"use client";

import { useState } from "react";
import { Send, X } from "lucide-react";
import { createComment } from "@/lib/data";
import type { CommentWithReply } from "@/lib/types";

export function CommentComposer({
  postId,
  replyingTo,
  onCancelReply,
  onCreated
}: {
  postId: string;
  replyingTo: CommentWithReply | null;
  onCancelReply: () => void;
  onCreated: () => void;
}) {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submitComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!content.trim()) {
      setStatus("写一点内容再回复。");
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      await createComment(postId, content.trim(), replyingTo?.id ?? null);
      setContent("");
      onCancelReply();
      setStatus("已回复。");
      onCreated();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "回复失败。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submitComment} className="rounded-md border border-ink/10 bg-panel/85 p-4 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="comment-content" className="text-sm font-semibold text-ink">
          写回复
        </label>
        {replyingTo ? (
          <button
            type="button"
            onClick={onCancelReply}
            className="inline-flex items-center gap-1 rounded-md bg-mist px-2 py-1 text-xs font-medium text-ink/65 hover:text-ink"
          >
            回复 #R{replyingTo.public_no}
            <X size={13} aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <textarea
        id="comment-content"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={4}
        maxLength={1200}
        placeholder={replyingTo ? `回复 #R${replyingTo.public_no}` : "回应主帖"}
        className="focus-ring mt-3 w-full rounded-md border border-ink/15 bg-paper px-3 py-3 text-sm leading-6"
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-ink/50">{content.length}/1200</span>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-md bg-moss px-4 py-2 text-sm font-semibold text-white hover:bg-moss/90 disabled:opacity-50"
        >
          <Send size={16} aria-hidden="true" />
          回复
        </button>
      </div>
      {status ? <p className="mt-3 text-sm text-ink/60">{status}</p> : null}
    </form>
  );
}
