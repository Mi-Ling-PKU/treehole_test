"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { setFavorite } from "@/lib/data";

export function FavoriteButton({
  postId,
  count,
  initialFavorited,
  onChanged
}: {
  postId: string;
  count: number;
  initialFavorited: boolean;
  onChanged?: () => void;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setFavorited(initialFavorited);
  }, [initialFavorited]);

  async function toggle() {
    setBusy(true);
    try {
      await setFavorite(postId, !favorited);
      setFavorited((value) => !value);
      onChanged?.();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={toggle}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${
        favorited ? "bg-clay/12 text-clay" : "text-ink/55 hover:bg-mist hover:text-ink"
      } disabled:opacity-50`}
    >
      <Star size={14} fill={favorited ? "currentColor" : "none"} aria-hidden="true" />
      <span>{count}</span>
    </button>
  );
}
