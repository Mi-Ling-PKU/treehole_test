"use client";

import { useEffect, useState } from "react";
import { Send, X } from "lucide-react";
import { createComment } from "@/lib/data";
import type { CommentView } from "@/lib/types";

export function CommentComposer({
  postId,
  replyingTo,
  onCancelReply,
  onCreated,
  surface = "card",
  draftKey
}: {
  postId: string;
  replyingTo: CommentView | null;
  onCancelReply: () => void;
  onCreated: () => void;
  surface?: "card" | "plain";
  draftKey?: string;
}) {
  const [content, setContent] = useState("");
  const [loadedDraftKey, setLoadedDraftKey] = useState<string | null>(draftKey ?? null);
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!draftKey) {
      setLoadedDraftKey(null);
      return;
    }

    setContent(window.localStorage.getItem(draftKey) ?? "");
    setLoadedDraftKey(draftKey);
  }, [draftKey]);

  useEffect(() => {
    if (!draftKey || loadedDraftKey !== draftKey) {
      return;
    }

    if (content) {
      window.localStorage.setItem(draftKey, content);
    } else {
      window.localStorage.removeItem(draftKey);
    }
  }, [content, draftKey, loadedDraftKey]);

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
      if (draftKey) {
        window.localStorage.removeItem(draftKey);
      }
      setContent("");
      onCancelReply();
      setStatus("已回复。");
      onCreated();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "暂时回复不了，请稍后再试。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submitComment}
      className={surface === "card" ? "rounded-md border border-ink/10 bg-panel/90 p-4 shadow-soft" : "space-y-3"}
    >
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
            回复 {replyingTo.author_name} #{replyingTo.sequence}
            <X size={13} aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <textarea
        id="comment-content"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={4}
        placeholder={replyingTo ? `回复 ${replyingTo.author_name} #${replyingTo.sequence}` : "回应这个树洞"}
        className="focus-ring mt-3 w-full rounded-md border border-ink/15 bg-paper px-3 py-3 text-sm leading-6"
      />
      <div className="mt-3 flex flex-wrap items-center justify-end gap-3">
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
