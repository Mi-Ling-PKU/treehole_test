"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteOwnContent } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import type { ReportTargetType } from "@/lib/types";

export function DeleteButton({
  targetType,
  targetId,
  authorId,
  onDeleted
}: {
  targetType: ReportTargetType;
  targetId: string;
  authorId: string;
  onDeleted?: () => void;
}) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setCurrentUserId(data.session?.user.id ?? null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUserId(session?.user.id ?? null);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  if (currentUserId !== authorId) {
    return null;
  }

  async function remove() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      await deleteOwnContent(targetType, targetId);
      setConfirming(false);
      onDeleted?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "暂时删除不了，请稍后再试。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        disabled={busy}
        onClick={remove}
        onBlur={() => setConfirming(false)}
        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${
          confirming ? "bg-clay/10 text-clay" : "text-ink/55 hover:bg-mist hover:text-ink"
        } disabled:opacity-50`}
        title={confirming ? "再次点击确认删除" : "删除"}
      >
        <Trash2 size={14} aria-hidden="true" />
        {confirming ? "确认删除" : "删除"}
      </button>
      {message ? <p className="text-xs text-clay">{message}</p> : null}
    </div>
  );
}
