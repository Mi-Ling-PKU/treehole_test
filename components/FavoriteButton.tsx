"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { toggleFavorite } from "@/lib/data";

export function FavoriteButton({
  postId,
  initialFavorited,
  onChanged
}: {
  postId: string;
  initialFavorited: boolean;
  onChanged?: () => void;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function toggle() {
    setSubmitting(true);
    setStatus(null);

    try {
      await toggleFavorite(postId, !favorited);
      setFavorited((value) => !value);
      onChanged?.();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "操作失败。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={submitting}
        onClick={toggle}
        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${
          favorited ? "bg-clay/12 text-clay" : "text-ink/55 hover:bg-mist hover:text-ink"
        } disabled:opacity-50`}
      >
        <Bookmark size={14} fill={favorited ? "currentColor" : "none"} aria-hidden="true" />
        {favorited ? "已收藏" : "收藏"}
      </button>
      {status ? <span className="text-xs text-ink/50">{status}</span> : null}
    </div>
  );
}
