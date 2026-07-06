"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { createReport } from "@/lib/data";
import type { ReportTargetType } from "@/lib/types";

export function ReportButton({ targetType, targetId }: { targetType: ReportTargetType; targetId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submitReport() {
    if (!reason.trim()) {
      setStatus("请填写举报原因。");
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      await createReport(targetType, targetId, reason.trim());
      setReason("");
      setOpen(false);
      setStatus("已提交举报。");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "举报失败。");
    } finally {
      setSubmitting(false);
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
            maxLength={600}
            placeholder="简要说明原因"
            className="focus-ring w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm"
          />
          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-ink/60 hover:bg-mist"
            >
              取消
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={submitReport}
              className="rounded-md bg-clay px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              提交
            </button>
          </div>
        </div>
      ) : null}
      {status ? <p className="text-xs text-ink/55">{status}</p> : null}
    </div>
  );
}
