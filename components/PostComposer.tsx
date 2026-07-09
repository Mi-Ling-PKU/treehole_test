"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Tag } from "lucide-react";
import { createPost } from "@/lib/data";

const postTags = ["课程", "科研", "就业", "二手市场", "失物招领"];

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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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

  function insertTag(tag: string) {
    const textarea = textareaRef.current;
    const tagText = `#${tag}`;

    if (!textarea) {
      setContent((value) => appendTag(value, tagText));
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = content.slice(0, start);
    const after = content.slice(end);
    const prefix = before && !/\s$/.test(before) ? " " : "";
    const suffix = after && !/^\s/.test(after) ? " " : "";
    const nextContent = `${before}${prefix}${tagText} ${suffix}${after}`;
    const nextCursor = before.length + prefix.length + tagText.length + 1;

    setContent(nextContent);
    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  }

  return (
    <form
      onSubmit={submitPost}
      className={surface === "card" ? "rounded-md border border-ink/10 bg-panel/90 p-4 shadow-soft" : "space-y-3"}
    >
      <div className="flex flex-wrap items-center justify-start gap-2">
        <label htmlFor="post-tag" className="inline-flex h-10 w-10 items-center justify-center rounded-md text-ink/65" title="标签">
          <Tag size={15} aria-hidden="true" />
        </label>
        <select
          id="post-tag"
          defaultValue=""
          onChange={(event) => {
            if (event.target.value) {
              insertTag(event.target.value);
              event.target.value = "";
            }
          }}
          className="focus-ring rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm"
        >
          <option value="" disabled>
            添加标签
          </option>
          {postTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>
      <textarea
        ref={textareaRef}
        id="post-content"
        aria-label="树洞内容"
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

function appendTag(content: string, tagText: string) {
  if (!content) {
    return `${tagText} `;
  }

  return `${content}${/\s$/.test(content) ? "" : " "}${tagText} `;
}
