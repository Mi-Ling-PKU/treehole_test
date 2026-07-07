"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { createReport } from "@/lib/data";
import type { ReportTargetType } from "@/lib/types";

export function ReportButton({ targetType, targetId }: { targetType: ReportTargetType; targetId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!reason.trim()) {
      setMessage("请写下举报原因。");
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      await createReport(targetType, targetId, reason.trim());
      setReason("");
      setOpen(false);
      setMessage("已收到举报。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "暂时提交不了举报，请稍后再试。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-ink/55 hover:bg-mist hover:text-ink"
      >
        <Flag size={14} aria-hidden="true" />
        举报
      </button>
      {open ? (
        <div className="rounded-md border border-ink/10 bg-panel p-3">
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            placeholder="说明你认为需要处理的原因"
            className="focus-ring w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm text-ink/60 hover:bg-mist">
              取消
            </button>
            <button type="button" disabled={busy} onClick={submit} className="rounded-md bg-clay px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
              提交
            </button>
          </div>
        </div>
      ) : null}
      {message ? <p className="text-xs text-ink/55">{message}</p> : null}
    </div>
  );
}
