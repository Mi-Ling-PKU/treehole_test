"use client";

import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { createPost } from "@/lib/data";

export function PostComposer({
  onCreated,
  surface = "card",
  draftKey
}: {
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

  async function submitPost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!content.trim()) {
      setStatus("写一点内容再发布。");
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      await createPost(content.trim());
      if (draftKey) {
        window.localStorage.removeItem(draftKey);
      }
      setContent("");
      setStatus("已发布。");
      onCreated();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "暂时发布不了，请稍后再试。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submitPost}
      className={surface === "card" ? "rounded-md border border-ink/10 bg-panel/85 p-4 shadow-soft" : "space-y-3"}
    >
      <label htmlFor="post-content" className="text-sm font-semibold text-ink">
        写进树洞
      </label>
      <textarea
        id="post-content"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={10}
        placeholder="这里不会公开显示你的账号。"
        className="focus-ring mt-3 w-full rounded-md border border-ink/15 bg-paper px-3 py-3 text-sm leading-6"
      />
      <div className="mt-3 flex flex-wrap items-center justify-end gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-md bg-moss px-4 py-2 text-sm font-semibold text-white hover:bg-moss/90 disabled:opacity-50"
        >
          <Send size={16} aria-hidden="true" />
          发布
        </button>
      </div>
      {status ? <p className="mt-3 text-sm text-ink/60">{status}</p> : null}
    </form>
  );
}
